import { Component, Inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ProfileConstants, RouterLinks } from '@app/app/app.constant';
import { CommonUtilService } from '@app/services';
import { GenerateOtpRequest, IsProfileAlreadyInUseRequest, ProfileService } from '@project-sunbird/sunbird-sdk';

export enum SignUpStage {
  BASIC_INFO = 'basic_info',
  ONBOARDING_INFO = 'onboarding_info',
  EMAIL_PASSWORD = 'email_password',
  OTP = 'otp'
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {

  Stage: SignUpStage;
  signUpStage = SignUpStage;
  signUpForm;
  onboardingDataPass: any;
  loader: any;
  constructor(@Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private router: Router,
    private commonUtilService: CommonUtilService) { }

  ngOnInit() {
    this.Stage = SignUpStage.BASIC_INFO;
    this.formInit();
  }
  formInit() {
    this.signUpForm = {
      basicInfo: null,
      onboardInfo: null,
      emailPassInfo: null,
      otp: null
    }
  }
  submitForm(name: string, data: object) {
    debugger
    this.signUpForm[name] = data;
    if (name == 'basicInfo') {
      this.onboardingDataPass = {
        isGoogleSignIn: true,
        userData: data
      }
    } else if (name == 'emailPassInfo') {
      this.emailPasswordSubmit();
    }

  }
  nextStage() {
    switch (this.Stage) {
      case this.signUpStage.BASIC_INFO:
        this.Stage = this.signUpStage.ONBOARDING_INFO;
        break;
      case this.signUpStage.ONBOARDING_INFO:
        this.Stage = this.signUpStage.EMAIL_PASSWORD;
        break;
      case this.signUpStage.EMAIL_PASSWORD:
        this.Stage = this.signUpStage.OTP;
        break;
      case this.signUpStage.OTP:
        this.formCompleted();
        break;
      default:
        this.Stage = this.signUpStage.BASIC_INFO;
        break;
    }
  }
  formCompleted() {
    console.log('form completed ', this.signUpForm);

  }
  prevStage() {
    switch (this.Stage) {
      case this.signUpStage.ONBOARDING_INFO:
        this.Stage = this.signUpStage.BASIC_INFO;
        break;
      case this.signUpStage.EMAIL_PASSWORD:
        this.Stage = this.signUpStage.ONBOARDING_INFO;
        break;
      case this.signUpStage.OTP:
        this.Stage = this.signUpStage.EMAIL_PASSWORD;
        break;
      default:
        this.Stage = this.signUpStage.BASIC_INFO;
        break;
    }
  }
  gotoLogin() {
    this.router.navigateByUrl(RouterLinks.LOGIN);
  }
  async emailPasswordSubmit() {
    debugger
    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      this.loader = await this.commonUtilService.getLoader();
      await this.loader.present();
      let req: IsProfileAlreadyInUseRequest;
      if (this.signUpForm['emailPassInfo'].contactType === ProfileConstants.CONTACT_TYPE_PHONE) {
        req = {
          key: this.signUpForm.emailPassInfo.phone,
          type: ProfileConstants.CONTACT_TYPE_PHONE
        };
      } else {
        req = {
          key: this.signUpForm.emailPassInfo.email,
          type: ProfileConstants.CONTACT_TYPE_EMAIL
        };
      }

      this.profileService.isProfileAlreadyInUse(req).subscribe(async (success: any) => {
        await this.loader.dismiss();
        this.loader = undefined;
        if (success && success.response) {
          // if (success.response.id === this.userId) {
          //   this.updateErr = true;
          // } else {
          //   this.err = true;
          // }   
        }
      }, async (error) => {
        if (error.response && error.response.body.params.err === 'UOS_USRRED0013' || error.response.body.params.err === 'UOS_USRRED009') {
          this.generateOTP();
        } else if (error.response && error.response.body.params.err === 'USER_NOT_FOUND') {
          // this.blockedAccount = true;
          if (this.loader) {
            await this.loader.dismiss();
            this.loader = undefined;
          }
        } else {
          if (this.loader) {
            await this.loader.dismiss();
            this.loader = undefined;
          }
        }
      });
    } else {
      this.commonUtilService.showToast('INTERNET_CONNECTIVITY_NEEDED');
    }
  }
  async generateOTP() {
    let req: GenerateOtpRequest;
    if (this.signUpForm['emailPassInfo'].contactType === ProfileConstants.CONTACT_TYPE_PHONE) {
      req = {
        key: this.signUpForm.emailPassInfo.phone,
        type: ProfileConstants.CONTACT_TYPE_PHONE
      };
    } else {
      req = {
        key: this.signUpForm.emailPassInfo.email,
        type: ProfileConstants.CONTACT_TYPE_EMAIL
      };
    }
    this.profileService.generateOTP(req).toPromise()
      .then(async () => {
        if (this.loader) {
          await this.loader.dismiss();
          this.loader = undefined;
        }
        console.log(this.signUpForm)
        // const navigationExtras: NavigationExtras = {
        //   state: {
        //     userData: this.userData
        //   }
        // };
        // this.router.navigate([RouterLinks.OTP], navigationExtras);
        // if (this.contactType === ProfileConstants.CONTACT_TYPE_PHONE) {
        //   this.popOverCtrl.dismiss({ isEdited: true, value: this.userData.phone });
        // } else {
        //   this.popOverCtrl.dismiss({ isEdited: true, value: this.userData.email });
        // }
      })
      .catch(async (err) => {
        if (this.loader) {
          await this.loader.dismiss();
          this.loader = undefined;
        }
        if (err.response && err.response.body.params.err === 'UOS_OTPCRT0059') {
          this.commonUtilService.showToast('You have exceeded the maximum limit for OTP, Please try after some time');
        }
      });
  }
}
