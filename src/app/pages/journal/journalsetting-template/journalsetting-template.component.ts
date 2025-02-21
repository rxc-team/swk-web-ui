import { Component, OnInit, Input } from '@angular/core';
import { FieldService, JournalService } from '@api';
import { NzModalService } from 'ng-zorro-antd/modal';
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

@Component({
  selector: 'app-journalsetting-template',
  templateUrl: './journalsetting-template.component.html',
  styleUrls: ['./journalsetting-template.component.less']
})
export class JournalsettingTemplateComponent implements OnInit {
  @Input() datastoreId: string;
  constructor(private js: JournalService, private fs: FieldService, private ms: NzModalService) {}

  // 可选台账字段
  swkFields: any[] = [];
  // 选择的模板
  selectedTemplate: any;
  // 选择的模板详情
  selectedDetailTemplate: any;
  // 模板详情页面可见标识
  isTemplateDetailsModalVisible = false;
  // 模板列表
  conditionTemplates: any[];
  // 加载标识符
  isLoading = false;

  ngOnInit(): void {
    this.isLoading = true;
    // 获取台账字段
    this.fs.getFields(this.datastoreId).then((data: any[]) => {
      if (data) {
        this.swkFields = data.filter(f => f.field_type === 'date' || f.field_type === 'number' || f.field_type === 'text');
        this.swkFields = this.swkFields.filter(f => !f.as_title);
      } else {
        this.swkFields = [];
      }
      this.swkFields = _.sortBy(this.swkFields, 'display_order');
    });
    this.getTemplates();
  }

  // 获取所有模板
  getTemplates() {
    this.js.getConditionTemplates().then((data: any) => {
      if (data) {
        this.conditionTemplates = data.condition_templates;
      } else {
        this.conditionTemplates = [];
      }
      // 默认选中第一个菜单项
      if (this.conditionTemplates && this.conditionTemplates != undefined && this.conditionTemplates.length > 0) {
        this.selectedTemplate = this.conditionTemplates[0].field_condition;
      }
      this.isLoading = false;
    });
  }

  // 删除模板
  removeTemplate(template_id: string) {
    this.ms.confirm({
      nzTitle: '操作を確認する',
      nzContent: '削除してもよろしいですか？',
      nzOnOk: () => {
        this.isLoading = true;
        this.js.deleteConditionTemplate(template_id).then(() => {
          this.getTemplates();
        });
      },
      nzOnCancel: () => {}
    });
  }

  // 打开模板详情
  openTemplateDetailsModal(item) {
    if (item.field_condition.then_type === 'field') {
      item.field_condition.then_selected_fieldId = item.field_condition.then_value;
    } else if (item.field_condition.then_type === 'value') {
      item.field_condition.then_fixed_value = item.field_condition.then_value;
    }
    if (item.field_condition.else_type === 'field') {
      item.field_condition.else_selected_fieldId = item.field_condition.else_value;
    } else if (item.field_condition.else_type === 'value') {
      item.field_condition.else_fixed_value = item.field_condition.else_value;
    }
    this.selectedDetailTemplate = item;
    this.isTemplateDetailsModalVisible = true;
  }

  // 关闭模板详情
  closeTemplateDetailsModal() {
    this.isTemplateDetailsModalVisible = false;
  }
}
