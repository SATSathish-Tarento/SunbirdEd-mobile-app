import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppGlobalService, CommonUtilService } from '@app/services';
import { ProfileService } from '@project-sunbird/sunbird-sdk';

@Component({
  selector: 'app-signup-basic-info',
  templateUrl: './signup-basic-info.component.html',
  styleUrls: ['./signup-basic-info.component.scss'],
})
export class SignupBasicInfoComponent implements OnInit {

  @Output() subformInitialized: EventEmitter<{}> = new EventEmitter<{}>();
  @Output() triggerNext: EventEmitter<boolean> = new EventEmitter<boolean>();

  birthYearOptions = [];
  date: any = new Date().toISOString();
  currentYear: any = (new Date()).getFullYear();
  personalInfoForm: FormGroup;
  appName = "";
  maxYear = new Date().getFullYear();
  minYear = 1921;
  constructor(
    @Inject('PROFILE_SERVICE') private profileService: ProfileService,
    private router: Router,
    private fb: FormBuilder,
    private appGlobalService: AppGlobalService,
    private commonUtilService: CommonUtilService) {
    this.initializeForm();
  }

  async ngOnInit() {
    this.appName = await this.commonUtilService.getAppName();
    // this.initiateYearSelecter();
  }
  initializeForm() {
    this.personalInfoForm = this.fb.group({
      name: ['', Validators.required],
      dob: ['', Validators.required]
    });
  }

  initiateYearSelecter() {
    const endYear = new Date().getFullYear();
    for (let year = endYear; year > 1921; year--) {
      this.birthYearOptions.push(year);
    }
  }

  continue() {
    debugger
    console.log(new Date().getFullYear())
    console.log(this.personalInfoForm.value.dob)
    console.log(new Date(this.personalInfoForm.value.dob).getFullYear())
    const req = {
      userId: this.appGlobalService.getCurrentUser().uid,
      name: this.personalInfoForm.value.name,
      dob: this.personalInfoForm.value.dob
    };
    if (this.personalInfoForm.valid) {
      const userData = {
        name: this.personalInfoForm.value.name,
        dob: new Date(this.personalInfoForm.value.dob).getFullYear(),
        isMinor: (new Date().getFullYear() - new Date(this.personalInfoForm.value.dob).getFullYear()) < 18
      }
      this.subformInitialized.emit(userData);
      this.triggerNext.emit();
    }
  }

}
