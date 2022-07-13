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
        message: 'Please enter password'
      },
      {
        type: FieldConfigValidationType.PATTERN,
        value: '^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[~.,)(}{\\[!"#$%&\'()*+,-./:;<=>?@[^_`{|}~\\]])(?=\\S+$).{8,}',
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
        },
        {
          type: FieldConfigValidationType.PATTERN,
          value: /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/,
          message: 'Please enter valid email address'
        },]
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
    this.userData.contactType = this.contactType
    this.subformInitialized.emit(this.userData);
    this.triggerNext.emit();
  }
  onFormEmailPasswordChange(value: any) {
    this.errorConfirmPassword = false;
    this.userData = value;
    if (value.confirmPassword && value.confirmPassword != value.password) this.errorConfirmPassword = true;
  }
  statusChanges(event) {
    this.isFormValid = event.isValid;
  }

}
