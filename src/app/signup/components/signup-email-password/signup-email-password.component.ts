import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { CommonUtilService } from '@app/services';
import { Platform } from '@ionic/angular';
import { FieldConfig, FieldConfigValidationType } from 'common-form-elements';
@Component({
  selector: 'app-signup-email-password',
  templateUrl: './signup-email-password.component.html',
  styleUrls: ['./signup-email-password.component.scss'],
})
export class SignUpEmailPasswordComponent implements OnInit {

  @Output() subformInitialized: EventEmitter<{}> = new EventEmitter<{}>();
  @Output() triggerNext: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() triggerPrev: EventEmitter<boolean> = new EventEmitter<boolean>();
  userData: any;
  contactType: string = 'phone';
  appName = "";
  mobileNumberConfig: FieldConfig<any>[] = [];;
  emailConfig: FieldConfig<any>[] = [];;
  passwordConfig: FieldConfig<any>[] = [];;
  emailPasswordConfig: FieldConfig<any>[] = [];
  isFormValid: boolean = false;
  errorConfirmPassword: boolean = false;
  loader: any;
  userId: string;

  constructor(
    public platform: Platform,
    private commonUtilService: CommonUtilService) { }

  ngOnInit() {
    this.contactType = 'phone';
    this.passwordConfig = [{
      code: 'password',
      type: 'input',
      templateOptions: {
        type: 'password',
        label: 'Password',
        placeHolder: 'Enter Password',
        showIcon: {
          show: true,
          image: {
            active: 'assets/imgs/eye.svg',
            inactive: 'assets/imgs/eye-off.svg'
          },
          direction: 'right'
        },
      },
      validations: [{
        type: FieldConfigValidationType.REQUIRED,
        value: null,
        message: 'Your password must contain a minimum of 8 characters. It must include numerals, lower and upper case alphabets and special characters, without any spaces.'
      }]
    },
    {
      code: 'confirmPassword',
      type: 'input',
      templateOptions: {
        type: 'password',
        label: 'Confirm Password',
        placeHolder: 'Re-enter the password',
        showIcon: {
          show: true,
          image: {
            active: 'assets/imgs/eye.svg',
            inactive: 'assets/imgs/eye-off.svg'
          },
          direction: 'right'
        },
      },
      validations: [{
        type: FieldConfigValidationType.REQUIRED,
        value: null,
        message: 'Please enter confirm password'
      }]
    }];
    this.mobileNumberConfig = [{
      code: 'phone',
      type: 'input',
      templateOptions: {
        type: 'tel',
        label: '',
        placeHolder: 'Enter Mobile Number',
      },
      validations: [{
        type: FieldConfigValidationType.REQUIRED,
        value: null,
        message: 'Please enter mobile number'
      },
      {
        type: FieldConfigValidationType.PATTERN,
        value: /^[6-9]\d{9}$/,
        message: 'Please enter valid mobile number'
      }]
    }];
    this.emailPasswordConfig = (this.mobileNumberConfig.concat(this.passwordConfig));
    this.setappname()
  }
  async setappname() {
    this.appName = await this.commonUtilService.getAppName();
  }

  contactTypeChange() {
    if (this.contactType === 'email') {
      this.emailConfig = [{
        code: 'email',
        type: 'input',
        templateOptions: {
          type: 'email',
          label: '',
          placeHolder: 'Enter Email Address',
        },
        validations: [{
          type: FieldConfigValidationType.REQUIRED,
          value: null,
          message: 'Please enter email address'
        }]
      }];
      this.emailPasswordConfig = this.emailConfig.concat(this.passwordConfig);
    } else if (this.contactType === 'phone') {
      this.emailPasswordConfig = this.mobileNumberConfig.concat(this.passwordConfig);
    }
  }
  back() {
    this.triggerPrev.emit();
  }
  continue() {
    console.log(this.emailPasswordConfig);
    this.userData.contactType = this.contactType
    this.subformInitialized.emit(this.userData);
    this.triggerNext.emit();
  }
  // async continue() {
  //   debugger
  //   if (this.commonUtilService.networkInfo.isNetworkAvailable) {
  //     this.loader = await this.commonUtilService.getLoader();
  //     await this.loader.present();
  //     let req: IsProfileAlreadyInUseRequest;
  //     if (this.contactType === ProfileConstants.CONTACT_TYPE_PHONE) {
  //       req = {
  //         key: this.userData.contactInfo.phone,
  //         type: ProfileConstants.CONTACT_TYPE_PHONE
  //       };
  //     } else {
  //       req = {
  //         key: this.userData.contactInfo.email,
  //         type: ProfileConstants.CONTACT_TYPE_EMAIL
  //       };
  //     }

  //     this.profileService.isProfileAlreadyInUse(req).subscribe(async (success: any) => {
  //       await this.loader.dismiss();
  //       this.loader = undefined;
  //       if (success && success.response) {
  //         // if (success.response.id === this.userId) {
  //         //   this.updateErr = true;
  //         // } else {
  //         //   this.err = true;
  //         // }   
  //       }
  //     }, async (error) => {
  //       if (error.response && error.response.body.params.err === 'UOS_USRRED0013' || error.response.body.params.err === 'UOS_USRRED009') {
  //         this.generateOTP();
  //       } else if (error.response && error.response.body.params.err === 'USER_NOT_FOUND') {
  //         // this.blockedAccount = true;
  //         if (this.loader) {
  //           await this.loader.dismiss();
  //           this.loader = undefined;
  //         }
  //       } else {
  //         if (this.loader) {
  //           await this.loader.dismiss();
  //           this.loader = undefined;
  //         }
  //       }
  //     });
  //   } else {
  //     this.commonUtilService.showToast('INTERNET_CONNECTIVITY_NEEDED');
  //   }
  // }

  onFormEmailPasswordChange(value: any) {
    console.log('onFormEmailPasswordChange')
    this.errorConfirmPassword = false;
    this.userData = value;
    if (value.confirmPassword && value.confirmPassword != value.password) this.errorConfirmPassword = true;

    console.log(value)
  }
  statusChanges(event) {
    this.isFormValid = event.isValid;
  }

}
