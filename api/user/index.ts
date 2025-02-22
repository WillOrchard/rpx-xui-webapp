import { getUserSessionTimeout, RoleGroupSessionTimeout } from '@hmcts/rpx-xui-node-lib';
import { AxiosResponse } from 'axios';
import { NextFunction, Response } from 'express';
import { UserInfo } from '../auth/interfaces/UserInfo';
import { getConfigValue } from '../configuration';
import { CASE_SHARE_PERMISSIONS, SERVICES_ROLE_ASSIGNMENT_API_PATH, SESSION_TIMEOUTS } from '../configuration/references';
import { http } from '../lib/http';
import { setHeaders } from '../lib/proxy';
import { exists } from '../lib/util';
import { LocationInfo, RoleAssignment } from './interfaces/roleAssignment';
import {
  getOrganisationRoles, getRoleCategoryFromRoleAssignments,
  getUserRoleCategory, isCurrentUserCaseAllocator
} from './utils';
import { trackTrace } from '../lib/appInsights';

export async function getUserDetails(req, res: Response, next: NextFunction): Promise<Response> {
  if (!exists(req, 'session.passport.user')) {
    return res.send({}).status(200);
  }

  try {
    const { roles } = req.session.passport.user.userinfo;

    const permissions = CASE_SHARE_PERMISSIONS.split(',');
    const canShareCases = roles.some((role) => permissions.includes(role));
    const sessionTimeouts = getConfigValue(SESSION_TIMEOUTS) as RoleGroupSessionTimeout[];
    const sessionTimeout = getUserSessionTimeout(roles, sessionTimeouts);
    const roleAssignmentInfo = await getUserRoleAssignments(req.session.passport.user.userinfo, req);
    const userInfo = { ...req.session.passport.user.userinfo, token: `Bearer ${req.session.passport.user.tokenset.accessToken}` };
    res.send({
      canShareCases,
      roleAssignmentInfo,
      sessionTimeout,
      userInfo
    });
  } catch (error) {
    next(error);
  }
}

export async function refreshRoleAssignmentForUser(userInfo: UserInfo, req: any): Promise<any[]> {
  let userRoleAssignments = [];
  if (userInfo) {
    const baseUrl = getConfigValue(SERVICES_ROLE_ASSIGNMENT_API_PATH);
    const id = userInfo.id ? userInfo.id : userInfo.uid;
    const path = `${baseUrl}/am/role-assignments/actors/${id}`;
    const headers = setHeaders(req);
    delete headers.accept;
    try {
      const response: AxiosResponse = await http.get(path, { headers });
      const activeRoleAssignments = getActiveRoleAssignments(response.data.roleAssignmentResponse, new Date());
      userRoleAssignments = getRoleAssignmentInfo(activeRoleAssignments);
      const idamRoles = getOrganisationRoles(activeRoleAssignments);
      userInfo.roles = userInfo.roles.concat(idamRoles);
      const roleAssignments: string[] = userRoleAssignments.filter((role) => role && !!role.roleCategory).length > 0 ?
        userRoleAssignments.map((roles) => roles.roleCategory) : [];
      // We check for the roleAssignments to determine the roleCategory. If not we try IDAM roles
      userInfo.roleCategory = getRoleCategoryFromRoleAssignments(roleAssignments) || getUserRoleCategory(userInfo.roles);
      req.session.roleAssignmentResponse = activeRoleAssignments;
    } catch (error) {
      let err = error;
      if (typeof error === 'object' && error !== null) {
        err = JSON.stringify(error);
      }
      trackTrace(err, { functionCall: 'refreshRoleAssignmentForUser' });
    }
  } else {
    trackTrace('userInfo is null', { functionCall: 'refreshRoleAssignmentForUser' });
  }
  return userRoleAssignments;
}

export function getActiveRoleAssignments(roleAssignments: RoleAssignment[], filterDate: Date): RoleAssignment[] {
  const activeRoleAssignments = roleAssignments.filter((rm) => {
    return rm.endTime ? filterDate <= new Date(rm.endTime) : true;
  });
  return activeRoleAssignments;
}

export function getRoleAssignmentInfo(roleAssignmentResponse: RoleAssignment[]): LocationInfo[] {
  const roleAssignmentInfo = [];
  roleAssignmentResponse.forEach((roleAssignment) => {
    const isCaseAllocator = isCurrentUserCaseAllocator(roleAssignment);
    const attributes = { ...roleAssignment.attributes };
    attributes.isCaseAllocator = isCaseAllocator;
    attributes.roleType = roleAssignment.roleType;
    attributes.roleName = roleAssignment.roleName;
    attributes.roleCategory = roleAssignment.roleCategory;
    roleAssignmentInfo.push(attributes);
  });
  return roleAssignmentInfo;
}

export async function getUserRoleAssignments(userInfo: UserInfo, req): Promise<any[]> {
  const roleAssignmentInfo = req.session.roleAssignmentResponse ?
    getRoleAssignmentInfo(req.session.roleAssignmentResponse) :
    await refreshRoleAssignmentForUser(userInfo, req);
  return roleAssignmentInfo;
}
