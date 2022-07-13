import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OTPTemplates, ProfileConstants } from '@app/app/app.constant';
import { CommonUtilService } from '@app/services';
import { GenerateOtpRequest, HttpClientError, ProfileService, VerifyOtpRequest } from '@project-sunbird/sunbird-sdk';
import { Location as SbLocation } from '@project-sunbird/client-services/models/location';
import { TncUpdateHandlerService } from '@app/services/handlers/tnc-update-handler.service';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss'],
})
export class OtpComponent implements OnInit {

  @Input() signUpData: any;
  @Output() subformInitialized: EventEmitter<{}> = new EventEmitter<{}>();
  @Output() triggerNext: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() triggerPrev: EventEmitter<boolean> = new EventEmitter<boolean>();
  public otpInfoForm: FormGroup;
  userData: any;
  appName = "";
  contactNumber = '';
  enableResend = true;
  acceptAgreement = false;
  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private _fb: FormBuilder,
    private commonUtilService: CommonUtilService,
    private tncUpdateHandlerService: TncUpdateHandlerService,
  ) { }

  async ngOnInit() {
    this.userData = this.signUpData;
    this.contactNumber = (this.userData?.emailPassInfo?.phone).replace(/\d(?=\d{4})/g, "*");
    this.otpInfoForm = this._fb.group({
      otp: ['', Validators.required],
    })

    this.appName = await this.commonUtilService.getAppName();
  }

  back() {
    this.triggerPrev.emit();
  }
  continue_old() {
    // this.triggerNext.emit();
    // alert('otp submited')

    this.subformInitialized.emit({ otp: this.otpInfoForm.controls['otp'].value });
    this.triggerNext.emit();
  }
  continue() {
    debugger
    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      let req: VerifyOtpRequest;
      if (this.userData.emailPassInfo.contactType === ProfileConstants.CONTACT_TYPE_PHONE) {
        req = {
          key: this.userData.emailPassInfo.phone,
          type: ProfileConstants.CONTACT_TYPE_PHONE,
          otp: this.otpInfoForm.value.otp,
          ...(this.userData.emailPassInfo.phone &&
            this.userData.emailPassInfo.phone.match(/(([a-z]|[A-Z])+[*]+([a-z]*[A-Z]*[0-9]*)*@)|([0-9]+[*]+[0-9]*)+/g) &&
            { userId: this.userData.userId })
        };
      } else {
        req = {
          key: this.userData.emailPassInfo.email,
          type: ProfileConstants.CONTACT_TYPE_EMAIL,
          otp: this.otpInfoForm.value.otp,
          ...(this.userData.emailPassInfo &&
            this.userData.emailPassInfo.match(/(([a-z]|[A-Z])+[*]+([a-z]*[A-Z]*[0-9]*)*@)|([0-9]+[*]+[0-9]*)+/g) &&
            { userId: this.userData.userId })
        };
      }
      this.profileService.verifyOTP(req).toPromise()
        .then(() => {
          const locationCodes = [];
          (Object.keys(this.userData.onboardInfo.location).map((acc, key) => {
            if (this.userData.onboardInfo.location[acc]) {
              const location: SbLocation = this.userData.onboardInfo.location[acc] as SbLocation;
              if (location.type) {
                locationCodes.push({
                  type: location.type,
                  code: location.code
                });
              }
            }
          }, {}));
          const profileReq = {
            userId: this.userData.userId,
            profileLocation: locationCodes,
            firstName: this.userData.basicInfo.name,
            lastName: '',
            dob: this.userData.basicInfo.dob,
            profileUserTypes: this.userData.profileUserTypes[0]
          };
          this.profileService.updateServerProfile(profileReq).toPromise()
            .then(async (data) => {
              const profile = await this.profileService.getActiveSessionProfile(
                { requiredFields: ProfileConstants.REQUIRED_FIELDS }).toPromise();
              await this.tncUpdateHandlerService.checkForTncUpdate();
            }).catch((error) => {
              console.error(error);
            })
        })
        .catch(error => {
          if (HttpClientError.isInstance(error)
            && error.response.responseCode === 400) {
            if (typeof error.response.body === 'object') {
              if (error.response.body.params.err === 'UOS_OTPVERFY0063' &&
                error.response.body.result.remainingAttempt > 0) {
                // this.remainingAttempts = error.response.body.result.remainingAttempt;
                // this.otp = '';
                // this.invalidOtp = true;
              } else {
                this.commonUtilService.showToast('OTP_FAILED');
              }
            }
          }
        });
    } else {
      this.commonUtilService.showToast('INTERNET_CONNECTIVITY_NEEDED');
    }
  }

  async resendOTP() {
    if (this.commonUtilService.networkInfo.isNetworkAvailable) {
      this.enableResend = !this.enableResend;
      let req: GenerateOtpRequest;
      if (this.userData.contactInfo.type === ProfileConstants.CONTACT_TYPE_PHONE) {
        req = {
          key: this.userData.contactInfo.phone,
          type: ProfileConstants.CONTACT_TYPE_PHONE,
          ...(this.userData.contactInfo &&
            this.userData.contactInfo.match(/(([a-z]|[A-Z])+[*]+([a-z]*[A-Z]*[0-9]*)*@)|([0-9]+[*]+[0-9]*)+/g) &&
            { userId: this.userData.userId, templateId: OTPTemplates.EDIT_CONTACT_OTP_TEMPLATE })
        };
      } else {
        req = {
          key: this.userData.contactInfo.email,
          type: ProfileConstants.CONTACT_TYPE_EMAIL,
          ...(this.userData.contactInfo.email &&
            this.userData.contactInfo.email.match(/(([a-z]|[A-Z])+[*]+([a-z]*[A-Z]*[0-9]*)*@)|([0-9]+[*]+[0-9]*)+/g) &&
            { userId: this.userData.userId, templateId: OTPTemplates.EDIT_CONTACT_OTP_TEMPLATE })
        };
      }
      let loader = await this.commonUtilService.getLoader();
      await loader.present();
      this.profileService.generateOTP(req).toPromise()
        .then(async () => {
          this.commonUtilService.showToast('OTP_RESENT');
          await loader.dismiss();
          loader = undefined;
        })
        .catch(async (e) => {
          if (loader) {
            this.commonUtilService.showToast('SOMETHING_WENT_WRONG');
            await loader.dismiss();
            loader = undefined;
          }
        });
    } else {
      this.commonUtilService.showToast('INTERNET_CONNECTIVITY_NEEDED');
    }
  }
  changeEvent(event) {
    this.acceptAgreement = event.target.checked;
  }

}
