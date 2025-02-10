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
      confimMethod: ['sabun'],
      journalType: ['primary']
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
  currentItem: string;
  fieldId: '';
  api_key: string;
  jsonContent = '';
  isModalVisible = false; // 控制Modal的显示与隐藏
  SelectJournals: any[] = [];
  SelectedJournals: any[] = [];
  isOpen = {};
  journalType = '';

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
      if (res && res.journal_type) {
        this.journalType = res.journal_type;
        this.form.controls.journalType.setValue(res.journal_type);
      }
    });
    this.form.patchValue({ handleMonth: this.handleMonth });

    this.js.getSelectJournals().then((data: any[]) => {
      if (data) {
        this.SelectedJournals = data;
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
      confim_method: this.form.controls.confimMethod.value,
      journal_type: this.form.controls.journalType.value
    };
    this.appService.modifySwkSetting(this.appId, params);
    this.message.success(this.i18n.translateLang('common.message.success.S_002'));
    this.init();
  }

  buildData(data: any[]) {
    const dataList = [];
    let line = 1;
    if (this.journalType == 'primary') {
      data.forEach((journal, i) => {
        const patterns: any[] = journal.patterns;
        patterns.forEach((pattern, j) => {
          if (pattern.journal_type == 'primary') {
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
          }
        });
      });
    } else {
      data.forEach((journal, i) => {
        const patterns: any[] = journal.patterns;
        patterns.forEach((pattern, j) => {
          if (pattern.journal_type == 'single') {
            const subjects: any[] = pattern.subjects;
            dataList.push({
              no: line,
              name: pattern.pattern_name,
              debt: '',
              credit: '',
              amount: '',
              other: ''
            });
            // 用于合并行
            let mergedRow = null;
            let index = 1;
            subjects.forEach((subject, k) => {
              const isLendingDivision1 = subject.lending_division === '1';
              const isLendingDivision2 = subject.lending_division === '2';

              if (isLendingDivision1 || isLendingDivision2) {
                // 如果没有合并行，则创建新的合并行
                if (!mergedRow) {
                  mergedRow = {
                    no: '',
                    name: `${line}-${index}`,
                    debt: isLendingDivision2 ? subject.default_name : '',
                    credit: isLendingDivision1 ? subject.default_name : '',
                    amount: subject.amount_name,
                    other: ''
                  };
                } else {
                  // 如果是同一行的内容，合并 'debt' 和 'credit'
                  if (isLendingDivision2) {
                    mergedRow.debt = subject.default_name;
                  }
                  if (isLendingDivision1) {
                    mergedRow.credit = subject.default_name;
                  }
                  index++;
                }
              }

              // 当两个lending_division的数据都处理完时，将合并行push到dataList
              if (mergedRow && ((isLendingDivision1 && mergedRow.debt) || (isLendingDivision2 && mergedRow.credit))) {
                dataList.push(mergedRow);
                // 重置mergedRow，准备处理下一个合并行
                mergedRow = null;
              }
            });
            line++;
          }
        });
      });
    }

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
    item.field_type = 'function';
    item.field_id = this.generateRandomFieldId();
    this.jsonContent = item.edit_content;
    this.fieldId = item.field_id;
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
      JSON.parse(this.jsonContent);
      // 找到对应item并更新 edit_content
      const updatedItem = this.selectedFields.find(field => field.field_id === this.fieldId);
      if (updatedItem) {
        updatedItem.edit_content = this.jsonContent;
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

  // 当子组件的 JSON 内容发生变化时，更新父组件的 jsonContent
  onJsonContentChange(newJsonContent: string) {
    this.jsonContent = newJsonContent;
  }

  // 打开弹窗
  openModal(): void {
    this.js.getJournals().then((data: any[]) => {
      if (data) {
        this.SelectJournals = data;
        // 设置勾选状态
        this.SelectJournals.forEach(journal => {
          // 如果SelectedJournals中存在已选择的journal_id，则将 selected 设置为 true
          journal.selected = this.SelectedJournals.some(selectJournal => selectJournal.journal_id === journal.journal_id);
        });
      } else {
        this.journals = [];
        this.SelectJournals = [];
      }
    });
    this.isModalVisible = true;
  }

  // 关闭弹窗
  closeModal(): void {
    this.isModalVisible = false;
  }

  applySelection(): void {
    // 过滤出选中的 journal
    const selectedJournalIds = this.SelectJournals.filter(journal => journal.selected).map(journal => journal.journal_id);

    // 根据 selectedJournalIds 过滤 SelectJournals
    this.SelectJournals = this.SelectJournals.filter(journal => selectedJournalIds.includes(journal.journal_id));
    const params = {
      selected_journal: selectedJournalIds
    };
    if (selectedJournalIds.length > 0) {
      this.js.addSelectJournals(params).then(() => {
        this.message.success(this.i18n.translateLang('common.message.success.S_001'));
      });
    }

    this.init();
    this.isModalVisible = false;
  }

  // 切换子项显示状态
  toggleChildren(data: any) {
    data.expanded = !data.expanded;
  }

  // 获取某个journal的所有内容
  getChildren(parentNo: number) {
    return this.journals.filter(item => item.no === '' && item.name.startsWith(parentNo.toString()));
  }
}
