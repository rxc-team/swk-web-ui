import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { format } from 'date-fns';

import { Component, OnInit } from '@angular/core';
import { AppService, DatastoreService, FieldService, JournalService } from '@api';
import { I18NService, TokenStorageService } from '@core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import _ from 'lodash';
import { forkJoin } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

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
      charEncoding: ['UTF-8', [Validators.required]],
      headerRow: ['exsit', [Validators.required]],
      separatorChar: ['separatorCharComma', [Validators.required]],
      lineBreaks: ['lf', [Validators.required]],
      fixedLength: [false],
      numberItems: [0, [Validators.required]],
      validFlag: ['', [Validators.required]],
      handleMonth: [this.handleMonth],
      confimMethod: ['sabun']
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
      title: 'ダウンロードフィールド名',
      width: '50px'
    },
    {
      title: 'フィールドタイプ',
      width: '50px'
    },
    {
      title: '設定方法',
      width: '50px'
    },
    {
      title: '編集内容',
      width: '50px'
    },
    {
      title: '日付形式',
      width: '50px'
    },
    {
      title: '',
      width: '20px'
    }
  ];

  handleMonth: string;
  appId: string;
  form: FormGroup;
  journals = [];
  swkFields: any[] = [];
  rkFields: any[] = [];
  selectedFields: any[] = [];
  selectedOption = '';
  swk_datastore_Id = '';
  rk_datastore_Id = '';
  // 当前选择的字段
  selectedField: any = null;
  confirmModal: NzModalRef;
  swkControl = false;
  // 控制弹窗显示与否
  isJsonEditorVisible = false;
  //json内容
  currentItem: { edit_content: string } = { edit_content: '' };
  fieldId: '';

  ngOnInit(): void {
    this.init();
  }

  async init(): Promise<void> {
    const job = [this.ds.getDatastoreByKey('shiwake')];
    await forkJoin(job)
      .toPromise()
      .then((data: any[]) => {
        const dsData = data[0];
        this.swk_datastore_Id = dsData.datastore_id;
      });

    const job1 = [this.ds.getDatastoreByKey('zougenrireki')];
    await forkJoin(job1)
      .toPromise()
      .then((data: any[]) => {
        const dsData = data[0];
        this.rk_datastore_Id = dsData.datastore_id;
      });

    const us = this.tokenService.getUser();
    const currentApp = us.current_app;
    const db = us.customer_id;

    // 获取初始设定值
    await this.appService.getAppByID(currentApp, db).then(res => {
      if (res && res.configs.syori_ym) {
        this.swkControl = res.swk_control;
        this.handleMonth = format(new Date(res.configs.syori_ym), 'yyyy-MM');
        this.form.patchValue({ handleMonth: this.handleMonth });
      } else {
        this.swkControl = res.swk_control;
        this.handleMonth = '';
        this.form.patchValue({ handleMonth: '' });
      }
      if (res && res.confim_method) {
        this.form.controls.confimMethod.setValue(res.confim_method);
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

    await this.fs.getFields(this.swk_datastore_Id).then((data: any[]) => {
      if (data) {
        this.swkFields = data.filter(f => f.field_type !== 'file');
        this.swkFields = this.swkFields.filter(f => !f.as_title);
      } else {
        this.swkFields = [];
      }

      this.swkFields = _.sortBy(this.swkFields, 'display_order');
    });

    await this.fs.getFields(this.rk_datastore_Id).then((data: any[]) => {
      if (data) {
        this.rkFields = data.filter(f => f.field_type !== 'file');
        this.rkFields = this.rkFields.filter(f => !f.as_title);
      } else {
        this.rkFields = [];
      }

      this.rkFields = _.sortBy(this.rkFields, 'display_order');
    });

    this.js.findDownloadSetting(currentApp).then((data: any[]) => {
      if (data['app_id'] != '') {
        const rules = [];
        this.form.controls.layoutName.setValue(data['layout_name']);
        this.form.controls.charEncoding.setValue(data['char_encoding']);
        this.form.controls.headerRow.setValue(data['header_row']);
        this.form.controls.separatorChar.setValue(data['separator_char']);
        this.form.controls.lineBreaks.setValue(data['line_breaks']);
        this.form.controls.fixedLength.setValue(data['fixed_length']);
        this.form.controls.numberItems.setValue(data['number_items']);
        this.form.controls.validFlag.setValue(data['valid_flag']);
        rules.push(...data['field_rule']);
        this.selectedFields = rules;
      }
    });
  }

  submit() {
    this.appId = this.tokenService.getUserApp();
    const params = {
      app_id: this.appId,
      handleMonth: format(new Date(this.form.value.handleMonth), 'yyyy-MM'),
      swk_control: this.swkControl,
      confim_method: this.form.controls.confimMethod.value
    };
    this.appService.modifySwkSetting(this.appId, params);
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
    this.selectedFields.forEach((item, index) => {
      if (!item.download_name) {
        this.message.error(`ダウンロードフィールド名を空にすることはできません`);
      }
    });
    const params = {
      layout_name: this.form.controls.layoutName.value,
      char_encoding: this.form.controls.charEncoding.value,
      header_row: this.form.controls.headerRow.value,
      separator_char: this.form.controls.separatorChar.value,
      line_breaks: this.form.controls.lineBreaks.value,
      fixed_length: this.form.controls.fixedLength.value,
      number_items: this.form.controls.numberItems.value,
      valid_flag: this.form.controls.validFlag.value,
      field_rule: this.selectedFields
    };

    this.js.addDownloadSetting(params).then(() => {
      this.message.success(this.i18n.translateLang('common.message.success.S_001'));
    });
  }

  addField() {
    this.selectedFields = [
      ...this.selectedFields,
      {
        field_id: '',
        setting_method: '2',
        download_name: '',
        edit_content: '',
        field_name: '',
        datastore_id: '',
        field_type: '',
        format: ''
      }
    ];
  }

  // 删除字段
  deleteField(index: number) {
    this.selectedFields.splice(index, 1);
  }

  updateFieldInfo(item: any) {
    if (item.setting_method == '2') {
      const selectedField = this.swkFields.find(field => field.field_id === item.field_id);
      if (selectedField) {
        item.field_name = selectedField.field_name;
        item.field_type = selectedField.field_type;
        item.download_name = this.i18n.translateLang(selectedField.field_name);
        item.datastore_id = this.swk_datastore_Id;
      }
    } else if (item.setting_method == '3') {
      const selectedField = this.rkFields.find(field => field.field_id === item.field_id);
      if (selectedField) {
        item.field_name = selectedField.field_name;
        item.field_type = selectedField.field_type;
        item.download_name = this.i18n.translateLang(selectedField.field_name);
        item.datastore_id = this.rk_datastore_Id;
      }
    }
  }

  onDrop(event: CdkDragDrop<any[]>): void {
    const previousIndex = this.selectedFields.findIndex(item => item === event.item.data);
    const currentIndex = event.currentIndex;
    if (previousIndex !== currentIndex) {
      moveItemInArray(this.selectedFields, previousIndex, currentIndex);
    }
  }

  // 打开 JSON 编辑弹窗
  openJsonEditor(item: any): void {
    this.currentItem = { edit_content: item.edit_content || '' };
    item.field_type = 'function';
    item.field_id = this.generateRandomFieldId();
    this.fieldId = item.field_id;
    item.edit_content = this.currentItem.edit_content;
    this.isJsonEditorVisible = true;
  }

  // 关闭 JSON 编辑弹窗
  closeJsonEditor(): void {
    this.isJsonEditorVisible = false;
  }

  // 保存 JSON 内容
  saveJson(): void {
    try {
      //解析JSON确保格式正确
      JSON.parse(this.currentItem.edit_content);
      // 找到对应item并更新 edit_content
      const updatedItem = this.selectedFields.find(field => field.field_id === this.fieldId);
      if (updatedItem) {
        updatedItem.edit_content = this.currentItem.edit_content;
      }
      this.closeJsonEditor();
    } catch (e) {
      this.message.error('間違ったJSON形式、チェックしてください');
    }
  }

  // 随机生成唯一的 field_id
  generateRandomFieldId(): string {
    return 'field_' + Math.floor(1000 + Math.random() * 9000).toString();
  }
}
