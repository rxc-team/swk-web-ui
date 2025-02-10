import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { Component, OnInit } from '@angular/core';
import { AppService, JournalService } from '@api';
import { I18NService, TokenStorageService } from '@core';

@Component({
  selector: 'app-journal-list',
  templateUrl: './journal-list.component.html',
  styleUrls: ['./journal-list.component.less']
})
export class JournalListComponent implements OnInit {
  constructor(
    private js: JournalService,
    private message: NzMessageService,
    private i18n: I18NService,
    private modal: NzModalService,
    private appService: AppService,
    private tokenService: TokenStorageService
  ) {}

  journals = [];
  journalIds = [];
  confirmModal: NzModalRef;

  ngOnInit(): void {
    this.js.getSelectJournals().then((data: any[]) => {
      if (data) {
        this.journals = data;
        this.journalIds = this.journals.map(journal => journal.journal_id);
      } else {
        this.journals = [];
      }
    });
  }

  async compute(section?: string) {
    const us = this.tokenService.getUser();
    const currentApp = us.current_app;
    const db = us.customer_id;

    // 判断 this.journalIds 是否包含分录结构体
    const isValidJournal = (section?: string): boolean => {
      if (section === 'repay') {
        return this.journalIds.includes('02');
      } else if (section === 'pay') {
        return this.journalIds.includes('03');
      } else {
        return this.journalIds.some(id => ['01', '04', '05', '06', '07'].includes(id));
      }
    };
    if (!isValidJournal(section)) {
      if (section === 'repay') {
        this.message.error(this.i18n.translateLang('common.message.error.E_026'));
      } else if (section === 'pay') {
        this.message.error(this.i18n.translateLang('common.message.error.E_025'));
      } else {
        this.message.error(this.i18n.translateLang('common.message.error.E_027'));
      }
      return;
    } else {
      await this.appService.getAppByID(currentApp, db).then(res => {
        if (res.swk_control) {
          let confirmTitle = this.i18n.translateLang('common.message.confirm.journalTitle');
          let confirmContent = this.i18n.translateLang('common.message.confirm.journalContent');
          if (section === 'repay') {
            confirmTitle = this.i18n.translateLang('common.message.confirm.repayJournalTitle');
            confirmContent = this.i18n.translateLang('common.message.confirm.repayJournalContent');
          }
          if (section === 'pay') {
            confirmTitle = this.i18n.translateLang('common.message.confirm.payJournalTitle');
            confirmContent = this.i18n.translateLang('common.message.confirm.payJournalContent');
          }

          this.confirmModal = this.modal.confirm({
            nzTitle: confirmTitle,
            nzContent: confirmContent,
            nzOnOk: async () =>
              await this.js.computeJournal(section).then(() => {
                this.message.success(this.i18n.translateLang('common.message.success.S_013'));
              })
          });
        } else {
          this.message.error(this.i18n.translateLang('common.message.error.E_021'));
        }
      });
    }
  }
}
