import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';

import { Component, ViewChild, Input, OnInit } from '@angular/core';
import { FieldService, JournalService } from '@api';
import { I18NService } from '@core';
import { JournalsettingTemplateComponent } from '../journalsetting-template/journalsetting-template.component';

import _ from 'lodash';

// 定义条件和条件区的数据结构
interface Condition {
  con_field: string;
  con_operator: string;
  con_value: string;
  con_data_type: string;
}

interface ConditionGroup {
  type: 'and' | 'or'; // 组内连接符
  field_cons: Condition[]; // 组内的条件
  switch_type?: 'and' | 'or'; // 组与组之间的连接符
}

interface CostumField {
  custom_field_type: string;
  custom_field_value: string;
  custom_field_data_type: string;
}

interface IfCondition {
  field_groups: ConditionGroup[];
  then_custom_fields?: CostumField[];
  else_custom_fields?: CostumField[];
  condition_name: string;
  active: boolean;
  collapaseNotice: string;
  then_type?: string;
  then_custom_type?: string;
  else_custom_type?: string;
  else_type?: string;
  pre_else_type?: string;
  then_selected_fieldId?: string;
  then_fixed_value?: string;
  else_selected_fieldId?: string;
  else_fixed_value?: string;
  then_value: string;
  else_value: string;
  then_value_data_type: string;
  else_value_data_type: string;
}

interface ConditionTemplate {
  template_id: string;
  template_name: string;
  field_condition: IfCondition;
}

@Component({
  selector: 'app-journalsetting-condition',
  templateUrl: './journalsetting-condition.component.html',
  styleUrls: ['./journalsetting-condition.component.less'],
  providers: []
})
export class JournalsettingConditionComponent implements OnInit {
  @ViewChild(JournalsettingTemplateComponent) childComponent: JournalsettingTemplateComponent;
  @Input() datastoreId: string;
  @Input() ifConditions: IfCondition[] = [];

  constructor(
    private ms: NzModalService,
    private fs: FieldService,
    private js: JournalService,
    private message: NzMessageService,
    private i18n: I18NService
  ) {}

  // 加载中标识符
  isLoading = true;
  // 可选台账字段
  swkFields: any[] = [];
  numberSwkFields: any[] = [];
  strSwkFields: any[] = [];
  strAndNumberSwkFields: any[] = [];
  // 模板窗口可视标识
  isTemplateModalVisible = false;
  // 选中的条件编号
  selectedIfIndex: number;
  // 模板保存窗口可视标识
  isSaveTemplateModalVisible = false;
  // 保存模板名称
  saveTemplateName: string;
  // 选中要保存的模板
  selectdCondition: IfCondition;

  ngOnInit() {
    // modal框内查询可选字段
    this.fs.getFields(this.datastoreId).then((data: any[]) => {
      if (data) {
        this.swkFields = data.filter(f => f.field_type === 'date' || f.field_type === 'number' || f.field_type === 'text');
        this.swkFields = this.swkFields.filter(f => !f.as_title);
      } else {
        this.swkFields = [];
      }
      this.swkFields = _.sortBy(this.swkFields, 'display_order');
      // swk字段类型筛选
      this.numberSwkFields = this.swkFields.filter(f => f.field_type === 'number');
      this.strAndNumberSwkFields = this.swkFields.filter(f => f.field_type === 'number' || f.field_type === 'text');
      this.strSwkFields = this.swkFields.filter(f => f.field_type === 'text');
      this.isLoading = false;
    });
  }

  // 添加条件
  addIfCondition() {
    if (this.ifConditions === null) {
      this.ifConditions = [
        {
          field_groups: [],
          condition_name: '',
          active: true,
          collapaseNotice: '詳細を非表示',
          then_value: '',
          else_value: '',
          then_type: '',
          else_type: '',
          then_selected_fieldId: '',
          then_fixed_value: '',
          else_selected_fieldId: '',
          else_fixed_value: '',
          then_value_data_type: 'text',
          else_value_data_type: 'text'
        }
      ];
    } else {
      this.ifConditions.push({
        field_groups: [],
        condition_name: '',
        active: true,
        collapaseNotice: '詳細を非表示',
        then_value: '',
        else_value: '',
        then_type: '',
        else_type: '',
        then_selected_fieldId: '',
        then_fixed_value: '',
        else_selected_fieldId: '',
        else_fixed_value: '',
        then_value_data_type: 'text',
        else_value_data_type: 'text'
      });
    }
  }

  // 各级删除条件和添加条件如下
  removeIfCondition(ifIndex: number) {
    if (ifIndex >= 1 && !(this.ifConditions.length > ifIndex + 1)) {
      this.ifConditions[ifIndex - 1].else_type = 'value';
      this.ifConditions[ifIndex - 1].pre_else_type = 'value';
      this.ifConditions[ifIndex - 1].else_fixed_value = '';
      this.ifConditions[ifIndex - 1].else_custom_type = '';
      this.ifConditions[ifIndex - 1].else_custom_fields = [];
      this.ifConditions[ifIndex - 1].else_value_data_type = 'text';
    }
    this.ifConditions.splice(ifIndex, 1);
  }

  // 删除后续所有条件
  removeAfterIfCondition(ifIndex: number) {
    this.ifConditions.splice(ifIndex + 1);
  }

  addConditionGroup(type: 'and' | 'or', ifIndex: number) {
    if (
      this.ifConditions[ifIndex].field_groups === null ||
      this.ifConditions[ifIndex].field_groups === undefined ||
      this.ifConditions.length === 0
    ) {
      this.ifConditions[ifIndex].field_groups = [{ type, field_cons: [], switch_type: 'and' }];
    } else {
      this.ifConditions[ifIndex].field_groups.push({ type, field_cons: [], switch_type: 'and' });
    }
  }

  addCondition(groupIndex: number, ifIndex: number) {
    this.ifConditions[ifIndex].field_groups[groupIndex].field_cons.push({
      con_field: '',
      con_operator: '',
      con_value: '',
      con_data_type: ''
    });
  }

  removeCondition(groupIndex: number, conditionIndex: number, ifIndex: number) {
    this.ifConditions[ifIndex].field_groups[groupIndex].field_cons.splice(conditionIndex, 1);
  }

  removeConditionGroup(groupIndex: number, ifIndex: number) {
    this.ifConditions[ifIndex].field_groups.splice(groupIndex, 1);
  }

  // 条件字段切换时
  onConFieldChange(value: string, ifIndex: number, groupIndex: number, conditionIndex: number) {
    // 找到当前字段获取数据类型并隐式存储到该条数据中
    const currentField = this.swkFields.find(item => item.field_id === value);
    const currentFieldType = currentField.field_type;
    this.ifConditions[ifIndex].field_groups[groupIndex].field_cons[conditionIndex].con_data_type = currentFieldType;
  }

  // Then结果类型切换时初始化自定义字段
  onThenTypeChange(value: string, ifIndex: number) {
    this.ifConditions[ifIndex].then_custom_type = '';
    this.ifConditions[ifIndex].then_custom_fields = [];
    this.ifConditions[ifIndex].then_value = '';
    this.ifConditions[ifIndex].then_selected_fieldId = '';
    this.ifConditions[ifIndex].then_fixed_value = '';
    if (value === 'field' || value === 'value') {
      this.ifConditions[ifIndex].then_value_data_type = 'text';
    } else {
      this.ifConditions[ifIndex].then_value_data_type = '';
    }
  }

  // Then字段切换
  onThenFieldChange(value: string, ifIndex: number) {
    const currentField = this.swkFields.find(item => item.field_id === value);
    const currentFieldType = currentField.field_type;
    this.ifConditions[ifIndex].then_value_data_type = currentFieldType;
  }

  // Then函数类型切换处理
  onThenCustomTypeChange(value: string, ifIndex: number) {
    this.ifConditions[ifIndex].then_custom_fields = [
      {
        custom_field_type: 'field',
        custom_field_value: '',
        custom_field_data_type: 'text'
      }
    ];
  }

  // Else函数类型切换处理
  onElseCustomTypeChange(value: string, ifIndex: number) {
    this.ifConditions[ifIndex].else_custom_fields = [
      {
        custom_field_type: 'field',
        custom_field_value: '',
        custom_field_data_type: 'text'
      }
    ];
  }

  // Else函数结果切换处理
  onElseTypeChange(value: string, ifIndex: number) {
    this.ifConditions[ifIndex].else_fixed_value = '';
    this.ifConditions[ifIndex].else_selected_fieldId = '';
    this.ifConditions[ifIndex].else_custom_type = '';
    this.ifConditions[ifIndex].else_custom_fields = [];
    this.ifConditions[ifIndex].else_value = '';
    // 数据类型处理
    if (value === 'field' || value === 'value') {
      this.ifConditions[ifIndex].else_value_data_type = 'text';
    } else {
      this.ifConditions[ifIndex].else_value_data_type = '';
    }
    // 新规条件处理
    if (value === 'new' && !(this.ifConditions.length > ifIndex + 1)) {
      this.addIfCondition();
      this.ifConditions[ifIndex].pre_else_type = value;
    } else if (value !== 'new' && this.ifConditions[ifIndex].pre_else_type === 'new') {
      this.ms.confirm({
        nzTitle: '操作を確認する',
        nzContent: '条件追加をキャンセルしたため、この操作により以下の条件がすべて削除されます。よろしいですか?',
        nzOnOk: () => {
          this.removeAfterIfCondition(ifIndex);
          this.ifConditions[ifIndex].pre_else_type = value;
        },
        nzOnCancel: () => {
          this.ifConditions[ifIndex].else_type = 'new';
          this.ifConditions[ifIndex].pre_else_type = 'new';
        }
      });
    }
  }

  // Else字段切换
  onElseFieldChange(value: string, ifIndex: number) {
    const currentField = this.swkFields.find(item => item.field_id === value);
    const currentFieldType = currentField.field_type;
    this.ifConditions[ifIndex].else_value_data_type = currentFieldType;
  }

  // 添加自定义Then字段
  addThenField(ifIndex: number) {
    if (this.ifConditions[ifIndex].then_custom_type === 'add') {
      // 算数强制数字类型
      this.ifConditions[ifIndex].then_custom_fields.push({
        custom_field_type: 'field',
        custom_field_value: '',
        custom_field_data_type: 'number'
      });
    } else {
      this.ifConditions[ifIndex].then_custom_fields.push({
        custom_field_type: 'field',
        custom_field_value: '',
        custom_field_data_type: 'text'
      });
    }
  }

  // 删除自定义Then字段
  removeThenField(ifIndex: number, fieldIndex: number) {
    this.ifConditions[ifIndex].then_custom_fields.splice(fieldIndex, 1);
  }

  // 添加自定义Else字段
  addElseField(ifIndex: number) {
    if (this.ifConditions[ifIndex].else_custom_type === 'add') {
      this.ifConditions[ifIndex].else_custom_fields.push({
        custom_field_type: 'field',
        custom_field_value: '',
        custom_field_data_type: 'number'
      });
    } else {
      this.ifConditions[ifIndex].else_custom_fields.push({
        custom_field_type: 'field',
        custom_field_value: '',
        custom_field_data_type: 'text'
      });
    }
  }
  // 删除自定义Else字段
  removeElseField(ifIndex: number, fieldIndex: number) {
    this.ifConditions[ifIndex].else_custom_fields.splice(fieldIndex, 1);
  }

  // Then自定义函数字段类型切换处理
  onThenCustomFieldTypeChange(value: string, ifIndex: number, fieldIndex: number) {
    this.ifConditions[ifIndex].then_custom_fields[fieldIndex].custom_field_value = '';
    // 算数强制数字类型
    if (this.ifConditions[ifIndex].then_custom_type === 'add') {
      this.ifConditions[ifIndex].then_custom_fields[fieldIndex].custom_field_data_type = 'number';
    }
  }

  // Else自定义函数字段类型切换处理
  onElseCustomFieldTypeChange(value: string, ifIndex: number, fieldIndex: number) {
    this.ifConditions[ifIndex].else_custom_fields[fieldIndex].custom_field_value = '';
    // 算数强制数字类型
    if (this.ifConditions[ifIndex].else_custom_type === 'add') {
      this.ifConditions[ifIndex].else_custom_fields[fieldIndex].custom_field_data_type = 'number';
    }
  }

  // Then自定义字段切换处理
  onThenCustomFieldChange(value: string, ifIndex: number, fieldIndex: number) {
    const currentField = this.swkFields.find(item => item.field_id === value);
    const currentFieldType = currentField.field_type;
    this.ifConditions[ifIndex].then_custom_fields[fieldIndex].custom_field_data_type = currentFieldType;
  }

  // Else自定义字段切换处理
  onElseCustomFieldChange(value: string, ifIndex: number, fieldIndex: number) {
    const currentField = this.swkFields.find(item => item.field_id === value);
    const currentFieldType = currentField.field_type;
    this.ifConditions[ifIndex].else_custom_fields[fieldIndex].custom_field_data_type = currentFieldType;
  }

  // 折叠面板点击触发
  collapaseChange(ifIndex: number) {
    if (this.ifConditions[ifIndex].active) {
      this.ifConditions[ifIndex].collapaseNotice = '詳細を非表示';
    } else {
      this.ifConditions[ifIndex].collapaseNotice = '詳細を表示';
    }
  }

  // 保存模板
  saveCondition(templateName?: string) {
    const saveCondition = this.selectdCondition;
    if (saveCondition.then_type === 'field') {
      saveCondition.then_value = saveCondition.then_selected_fieldId;
    } else if (saveCondition.then_type === 'value') {
      saveCondition.then_value = saveCondition.then_fixed_value;
    }
    if (saveCondition.else_type === 'field') {
      saveCondition.else_value = saveCondition.else_selected_fieldId;
    } else if (saveCondition.else_type === 'value') {
      saveCondition.else_value = saveCondition.else_fixed_value;
    }
    const conditionTemplate = {
      field_condition: saveCondition,
      template_id: this.generateRandomTemplateId(),
      template_name: templateName
    };

    const params = {
      condition_template: conditionTemplate
    };
    this.js.addConditionTemplate(params).then(() => {
      this.message.success('保存しました');
    });
  }

  // 打开模板modal框
  openTemplateModal(ifIndex: number) {
    this.isTemplateModalVisible = true;
    this.selectedIfIndex = ifIndex;
  }

  // 关闭模板modal框
  closeTemplateModal() {
    this.isTemplateModalVisible = false;
  }

  // 模板modal框OK按钮
  handleTemplateModalOK() {
    // 如果模板存在，模板数据初始化到条件列表中
    if (this.childComponent.selectedTemplate) {
      this.ifConditions[this.selectedIfIndex] = this.childComponent.selectedTemplate;
      this.ifConditions[this.selectedIfIndex].active = true;
      this.ifConditions[this.selectedIfIndex].collapaseNotice = '詳細を非表示';
      if (this.ifConditions[this.selectedIfIndex].then_type === 'field') {
        this.ifConditions[this.selectedIfIndex].then_selected_fieldId = this.ifConditions[this.selectedIfIndex].then_value;
      } else if (this.ifConditions[this.selectedIfIndex].then_type === 'value') {
        this.ifConditions[this.selectedIfIndex].then_fixed_value = this.ifConditions[this.selectedIfIndex].then_value;
      }
      if (this.ifConditions[this.selectedIfIndex].else_type === 'field') {
        this.ifConditions[this.selectedIfIndex].else_selected_fieldId = this.ifConditions[this.selectedIfIndex].else_value;
      } else if (this.ifConditions[this.selectedIfIndex].else_type === 'value') {
        this.ifConditions[this.selectedIfIndex].else_fixed_value = this.ifConditions[this.selectedIfIndex].else_value;
      } else if (this.ifConditions[this.selectedIfIndex].else_type === 'new') {
        this.addIfCondition();
      }
      // 非最终条件的处理
      if (this.ifConditions && this.ifConditions.length > this.selectedIfIndex + 1) {
        this.ifConditions[this.selectedIfIndex].else_type = 'new';
        this.ifConditions[this.selectedIfIndex].else_custom_fields = [];
        this.message.warning('最後の条件ではないため、条件が満たされない場合の出力が適用されない可能性があります');
      }
    }
    this.isTemplateModalVisible = false;
  }

  // 打开模板保存modal框
  openSaveTemplateModal(ifCondition) {
    this.saveTemplateName = '';
    this.selectdCondition = ifCondition;
    this.isSaveTemplateModalVisible = true;
  }

  // 关闭模板保存modal框
  closeSaveTemplateModal() {
    this.isSaveTemplateModalVisible = false;
  }

  // 模板保存modal框OK按钮
  handleSaveTemplateModalOK() {
    this.saveCondition(this.saveTemplateName);
    this.isSaveTemplateModalVisible = false;
  }

  // 随机生成唯一的 template_id
  generateRandomTemplateId(): string {
    return 'template_' + Math.floor(1000 + Math.random() * 9000).toString();
  }
}
