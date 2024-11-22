import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { format } from 'date-fns';

import { Component, OnInit } from '@angular/core';
import { AppService } from '@api';
import { I18NService, TokenStorageService } from '@core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-journal-list',
  templateUrl: './journalsetting-list.component.html',
  styleUrls: ['./journalsetting-list.less']
})
export class JournalsettingListComponent implements OnInit {
  constructor(
    private tokenService: TokenStorageService,
    private appService: AppService,
    private message: NzMessageService,
    private i18n: I18NService
  ) {}

  handleMonth: string;
  appId: string;
  form: FormGroup;

  confirmModal: NzModalRef;

  ngOnInit(): void {
    this.init();
  }

  async init(): Promise<void> {
    this.form = new FormGroup({
      handleMonth: new FormControl(this.handleMonth)
    });
    const us = this.tokenService.getUser();
    const currentApp = us.current_app;
    const db = us.customer_id;

    // 获取初始的年月
    await this.appService.getAppByID(currentApp, db).then(res => {
      if (res && res.configs.syori_ym) {
        this.handleMonth = format(new Date(res.configs.syori_ym), 'yyyy-MM');
        this.form.patchValue({ handleMonth: this.handleMonth });
      } else {
        this.handleMonth = '';
        this.form.patchValue({ handleMonth: '' });
      }
    });
  }

  submit() {
    this.appId = this.tokenService.getUserApp();
    const date = format(new Date(this.form.value.handleMonth), 'yyyy-MM');
    this.appService.modifyAppHandleMonth(this.appId, date);
    this.message.success(this.i18n.translateLang('common.message.success.S_002'));
    this.init();
  }
}
