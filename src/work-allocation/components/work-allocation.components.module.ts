import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { PipesModule } from '@hmcts/ccd-case-ui-toolkit';
import { ExuiCommonLibModule } from '@hmcts/rpx-xui-common-lib';
import * as fromComponents from '.';
import { WorkAllocationPipesModule } from '../pipes/work-allocation.pipes.module';
import { CaseworkerDataService, LocationDataService, WASupportedJurisdictionsService } from '../services';
import { PriorityFieldComponentModule } from './priority-field/priority.module';

// from containers
@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    ExuiCommonLibModule,
    RouterModule,
    FormsModule, // TODO: Remove this as it's only needed for testing.
    PipesModule,
    WorkAllocationPipesModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatInputModule,
    PriorityFieldComponentModule
  ],
  declarations: [
    ...fromComponents.components
  ],
  providers: [CaseworkerDataService, LocationDataService, WASupportedJurisdictionsService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [
    ...fromComponents.components
  ]
})
export class WorkAllocationComponentsModule {

}
