import { Component, OnInit } from '@angular/core';

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
  shinki_flag?: boolean;
}

@Component({
  selector: 'app-journalsetting-template',
  templateUrl: './journalsetting-template.component.html',
  styleUrls: ['./journalsetting-template.component.less']
})
export class JournalsettingTemplateComponent implements OnInit {
  constructor() {}

  // 选择的模板
  selectedTemplate: any;

  // 临时模板 模板功能TODO
  tempIfConditions: IfCondition[] = [
    {
      field_groups: [
        {
          type: 'and',
          field_cons: [
            { con_field: 'keiyakuno', con_operator: 'eq', con_value: '111', con_data_type: 'text' },
            { con_field: 'shiwakeno', con_operator: 'ne', con_value: '111', con_data_type: 'text' }
          ],
          switch_type: 'or'
        },
        {
          type: 'or',
          field_cons: [
            { con_field: 'keiyakuno', con_operator: 'eq', con_value: '111', con_data_type: 'text' },
            { con_field: 'shiwakeno', con_operator: 'ne', con_value: '111', con_data_type: 'text' }
          ],
          switch_type: 'and'
        }
      ],
      condition_name: 'テンプレート1',
      active: false,
      collapaseNotice: '詳細を表示',
      then_value: 'keiyakuno',
      else_value: 'keiyakuno',
      then_value_data_type: 'text',
      else_value_data_type: 'text'
    },
    {
      field_groups: [
        {
          type: 'and',
          field_cons: [
            { con_field: 'keiyakuno', con_operator: 'eq', con_value: '222', con_data_type: 'text' },
            { con_field: 'shiwakeno', con_operator: 'ne', con_value: '222', con_data_type: 'text' }
          ],
          switch_type: 'or'
        },
        {
          type: 'or',
          field_cons: [
            { con_field: 'keiyakuno', con_operator: 'eq', con_value: '222', con_data_type: 'text' },
            { con_field: 'shiwakeno', con_operator: 'ne', con_value: '222', con_data_type: 'text' }
          ],
          switch_type: 'and'
        }
      ],
      condition_name: 'テンプレート2',
      active: false,
      collapaseNotice: '詳細を表示',
      then_value: 'keiyakuno',
      else_value: 'keiyakuno',
      then_value_data_type: 'text',
      else_value_data_type: 'text'
    },
    {
      field_groups: [
        {
          type: 'and',
          field_cons: [
            { con_field: 'keiyakuno', con_operator: 'eq', con_value: '333', con_data_type: 'text' },
            { con_field: 'shiwakeno', con_operator: 'ne', con_value: '333', con_data_type: 'text' }
          ],
          switch_type: 'or'
        },
        {
          type: 'or',
          field_cons: [
            { con_field: 'keiyakuno', con_operator: 'eq', con_value: '333', con_data_type: 'text' },
            { con_field: 'shiwakeno', con_operator: 'ne', con_value: '333', con_data_type: 'text' }
          ],
          switch_type: 'and'
        }
      ],
      condition_name: 'テンプレート3',
      active: false,
      collapaseNotice: '詳細を表示',
      then_value: 'keiyakuno',
      else_value: 'keiyakuno',
      then_value_data_type: 'text',
      else_value_data_type: 'text'
    }
  ];

  ngOnInit(): void {}

  // 删除模板
  removeTemplate(tIndex: number) {
    this.tempIfConditions.splice(tIndex, 1);
  }
}
