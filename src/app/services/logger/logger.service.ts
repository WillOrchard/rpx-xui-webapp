import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { environment as config } from '../../../environments/environment';
import { UserInfo } from '../../models/user-details.model';
import { SessionStorageService } from '../session-storage/session-storage.service';
import { CryptoWrapper } from './cryptoWrapper';
import { MonitoringService } from './monitoring.service';

export interface ILoggerService {
  trace(message: any, ...additional: any[]): void;
  debug(message: any, ...additional: any[]): void;
  info(message: any, ...additional: any[]): void;
  log(message: any, ...additional: any[]): void;
  warn(message: any, ...additional: any[]): void;
  error(message: any, ...additional: any[]): void;
  fatal(message: any, ...additional: any[]): void;
  getMessage(message: any): string;
}

@Injectable({ providedIn: 'root' })
export class LoggerService implements ILoggerService {
  public COOKIE_KEYS;
  constructor(private readonly monitoringService: MonitoringService,
              private readonly ngxLogger: NGXLogger,
              private readonly sessionStorageService: SessionStorageService,
              private readonly cryptoWrapper: CryptoWrapper) {
    this.COOKIE_KEYS = {
      TOKEN: config.cookies.token,
      USER: config.cookies.userId
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public trace(message: any, ... additional: any[]): void {
    const formattedMessage = this.getMessage(message);
    this.ngxLogger.trace(formattedMessage);
    this.monitoringService.logEvent(message);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public debug(message: any, ...additional: any[]): void {
    const formattedMessage = this.getMessage(message);
    this.ngxLogger.debug(formattedMessage);
    this.monitoringService.logEvent(message);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public info(message: any, ...additional: any[]): void {
    const formattedMessage = this.getMessage(message);
    this.ngxLogger.info(formattedMessage);
    this.monitoringService.logEvent(message);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public log(message: any, ...additional: any[]): void {
    const formattedMessage = this.getMessage(message);
    this.ngxLogger.log(formattedMessage);
    this.monitoringService.logEvent(message);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public warn(message: any, ...additional: any[]): void {
    const formattedMessage = this.getMessage(message);
    this.ngxLogger.warn(formattedMessage);
    this.monitoringService.logEvent(message);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public error(message: any, ...additional: any[]): void {
    this.ngxLogger.error(message);
    const formattedMessage = this.getMessage(message);
    const error = new Error(formattedMessage);
    this.monitoringService.logException(error);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public fatal(message: any, ...additional: any[]): void {
    this.ngxLogger.fatal(message);
    const formattedMessage = this.getMessage(message);
    const error = new Error(formattedMessage);
    this.monitoringService.logException(error);
  }

  public getMessage(message: any): string {
    const userInfoStr = this.sessionStorageService.getItem('userDetails');
    if (userInfoStr) {
      const userInfo: UserInfo = JSON.parse(userInfoStr);
      if (userInfo && userInfo.email) {
        const userIdEncrypted = this.cryptoWrapper.encrypt(userInfo.email);
        return `User - ${userIdEncrypted.toString()}, Message - ${message}, Timestamp - ${Date.now()}`;
      }
    }
    return `Message - ${message}, Timestamp - ${Date.now()}`;
  }

  public enableCookies(): void {
    this.monitoringService.enableCookies();
  }
}
