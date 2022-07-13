import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { SignUpRoutingModule } from './signup-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { SignupComponent } from './components/signup/signup.component';
import { SignupBasicInfoComponent } from './components/signup-basic-info/signup-basic-info.component';
import { CommonFormElementsModule } from 'common-form-elements-v9';
import { SignUpEmailPasswordComponent } from './components/signup-email-password/signup-email-password.component';
import { DistrictMappingPageModule } from '../district-mapping/district-mapping.module';
import { OtpComponent } from './components/otp/otp.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SignUpRoutingModule,
    TranslateModule,
    CommonFormElementsModule,
    DistrictMappingPageModule
  ],
  declarations: [SignupComponent, SignupBasicInfoComponent, SignUpEmailPasswordComponent, OtpComponent]
})
export class SignUpModule { }
