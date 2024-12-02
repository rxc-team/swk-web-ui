import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { format } from 'date-fns';

import { Component, OnInit } from '@angular/core';
import { AppService, DatastoreService, FieldService, JournalService } from '@api';
import { I18NService, TokenStorageService } from '@core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import _ from 'lodash';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-journal-list',
  templateUrl: './journalsetting-list.component.html',
  styleUrls: ['./journalsetting-list.less']
})
export class JournalsettingListComponent implements OnInit {
  isSmall: any;
  constructor(
    private tokenService: TokenStorageService,
    private appService: AppService,
    private message: NzMessageService,
    private i18n: I18NService,
    private js: JournalService,
    private fs: FieldService,
    private fb: FormBuilder,
    public ds: DatastoreService
  ) {
    this.form = this.fb.group({
      layoutName: ['', [Validators.required]],
      charEncoding: ['', [Validators.required]],
      headerRow: ['', [Validators.required]],
      separatorChar: ['', [Validators.required]],
      lineBreaks: ['', [Validators.required]],
      fixedLength: [false],
      numberItems: [0, [Validators.required]],
      validFlag: ['', [Validators.required]],
      handleMonth: [this.handleMonth]
    });
  }

  cols = [
    {
      title: 'common.text.no',
      width: '40px'
    },
    {
      title: 'page.journal.type',
      width: '120px'
    },
    {
      title: 'page.journal.debt',
      width: '20%'
    },
    {
      title: 'page.journal.credit',
      width: '30%'
    },
    {
      title: 'page.journal.amount',
      width: '50%'
    }
  ];

  colsField = [
    {
      title: 'No',
      width: '20px'
    },
    {
      title: 'PITフィールド名',
      width: '50px'
    },
    {
      title: 'フィールドタイプ',
      width: '50px'
    },
    {
      title: 'フィールド名',
      width: '50px'
    },
    {
      title: 'ダウンロードフィールド名',
      width: '50px'
    },
    {
      title: '固定値',
      width: '50px'
    },
    {
      title: '',
      width: '50px'
    }
  ];

  handleMonth: string;
  appId: string;
  form: FormGroup;
  journals = [];
  fields: any[] = [];
  selectedFields: any[] = [];
  selectedOption = '';
  datastore_Id = '';
  // 当前选择的字段
  selectedField: any = null;
  confirmModal: NzModalRef;

  ngOnInit(): void {
    this.init();
  }

  async init(): Promise<void> {
    const job = [this.ds.getDatastoreByKey('shiwake')];
    await forkJoin(job)
      .toPromise()
      .then((data: any[]) => {
        const dsData = data[0];
        this.datastore_Id = dsData.datastore_id;
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
    this.form.patchValue({ handleMonth: this.handleMonth });

    this.js.getJournals().then((data: any[]) => {
      if (data) {
        this.journals = this.buildData(data);
      } else {
        this.journals = [];
      }
    });

    await this.fs.getFields(this.datastore_Id).then((data: any[]) => {
      if (data) {
        this.fields = data.filter(f => f.field_type !== 'file');
        this.fields = this.fields.filter(f => !f.as_title);
      } else {
        this.fields = [];
      }

      this.fields = _.sortBy(this.fields, 'display_order');
    });
  }

  submit() {
    this.appId = this.tokenService.getUserApp();
    const date = format(new Date(this.form.value.handleMonth), 'yyyy-MM');
    this.appService.modifyAppHandleMonth(this.appId, date);
    this.message.success(this.i18n.translateLang('common.message.success.S_002'));
    this.init();
  }

  buildData(data: any[]) {
    const dataList = [];
    let line = 1;
    data.forEach((journal, i) => {
      const patterns: any[] = journal.patterns;
      patterns.forEach((pattern, j) => {
        const subjects: any[] = pattern.subjects;
        dataList.push({
          no: line,
          name: pattern.pattern_name,
          debt: '',
          credit: '',
          amount: '',
          other: ''
        });
        subjects.forEach((subject, k) => {
          dataList.push({
            no: '',
            name: `${line}-${k + 1}`,
            debt: subject.lending_division === '2' ? subject.default_name : '',
            credit: subject.lending_division === '1' ? subject.default_name : '',
            amount: subject.amount_name,
            other: ''
          });
        });
        line++;
      });
    });
    return dataList;
  }

  addSetting() {
    const params = {
      layout_name: this.form.controls.layoutName.value,
      char_encoding: this.form.controls.charEncoding.value,
      header_row: this.form.controls.headerRow.value,
      separator_char: this.form.controls.separatorChar.value,
      line_breaks: this.form.controls.lineBreaks.value,
      fixed_length: this.form.controls.fixedLength.value,
      number_items: this.form.controls.numberItems.value,
      valid_flag: this.form.controls.validFlag.value,
      datastore_Id: this.datastore_Id,
      field_rule: this.selectedFields
    };
    console.log(params);
    this.js.addDownloadSetting(params).then(() => {
      this.message.success(this.i18n.translateLang('common.message.success.S_001'));
    });
  }

  addField() {
    if (this.selectedOption === '1') {
      this.selectedFields = [
        ...this.selectedFields,
        { field_id: '', field_type: 'text', download_name: '', fixed_value: '', is_fixedvalue: true, pit_name: '', field_name: '' }
      ];
    } else if (this.selectedOption === '2') {
      this.selectedFields = [
        ...this.selectedFields,
        { field_id: '', field_type: '', download_name: '', fixed_value: '', is_fixedvalue: false, pit_name: '', field_name: '' }
      ];
    }
  }

  // 删除字段
  deleteField(index: number) {
    this.selectedFields.splice(index, 1);
  }

  updateFieldInfo(item: any) {
    const selectedField = this.fields.find(field => field.field_id === item.field_id);
    if (selectedField) {
      item.field_name = selectedField.field_name;
      item.field_type = selectedField.field_type;
    }
  }
}
