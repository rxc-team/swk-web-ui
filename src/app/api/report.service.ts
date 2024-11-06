/*
 * @Description: 报表服务管理
 * @Author: RXC 呉見華
 * @Date: 2019-07-31 17:47:21
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2020-02-25 10:24:49
 */
import { format } from 'date-fns';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Condition } from './database.service';

export interface ColCondition {
  keiyakuno: string;
  date: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  // 设置全局url
  private url = 'report/reports';
  private urlPrs = 'item/datastores';

  constructor(private http: HttpClient) { }

  /**
   * @description: 获取所有的报表
   * @return: 返回后台数据
   */
  getReports(): Promise<any> {
    const params = {
      needRole: 'true'
    };
    return this.http
      .get(this.url, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 通过ID获取报表信息
   * @return: 返回后台数据
   */
  getReportByID(reportId: string): Promise<any> {
    return this.http
      .get(`${this.url}/${reportId}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 通过ID获取报表信息
   * @return: 返回后台数据
   */
  getReportCollect(reportId: string): Promise<any> {
    return this.http
      .get(`${this.url}/${reportId}`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 通过id获取报表
   * @return: 返回后台数据
   */
  getReportData(
    id: string,
    params: {
      condition_list: Condition[];
      condition_type: string;
      page_index: number;
      page_size: number;
    }
  ): Promise<any> {
    return this.http
      .post(`${this.url}/${id}/data`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 通过id获取报表
   * @return: 返回后台数据
   */
  genReportData(id: string): Promise<any> {
    return this.http
      .post(`report/gen/reports/${id}/data`, null, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 创建总表
   * @return: 返回后台数据
   */
  genColData(id: string,
    params: {
      items: any;
    }
  ): Promise<any> {
    const ps = {
      items: params.items
    };
    return this.http
      .post(`report/${id}/create`, ps, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 获取总表所有数据
   * @return: 返回后台数据
   */
  getColData(
    params: {
      page_index: number;
      page_size: number;
    }
  ): Promise<any> {
    return this.http
      .post(`report/colData`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 搜索总表数据
   * @return: 返回后台数据
   */
  selectColData(params: {
    page_index: number;
    page_size: number;
  },
    data?: {
      keiyakuno?: string;
      date?: Date;
    }): Promise<any> {
    if (data && data.keiyakuno) {
      params['keiyakuno'] = data.keiyakuno
    }
    if (data && data.date) {
      params['date'] = format(new Date(data.date), 'yyyy-MM-dd')
    }
    return this.http
      .post(`report/selectColData`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 搜索总表数据
   * @return: 返回后台数据
   */
  downloadColData(data?: {
    keiyakuno?: string;
    date?: Date;
    titlename?: any[]
  }): Promise<any> {
    const params = {};
    if (data && data.keiyakuno) {
      params['keiyakuno'] = data.keiyakuno;
    }
    if (data && data.date) {
      params['date'] = data.date;
    }
    if (data && data.titlename) {
      params['titlename'] = data.titlename;
    }
    return this.http
      .get(`report/downloadColData`, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 通过id获取报表
   * @return: 返回后台数据
   */
  download(
    id: string,
    jobId: string,
    fileType: string,
    conditions: {
      condition_list: Condition[];
      condition_type: string;
    }
  ): Promise<any> {
    const params = {
      job_id: jobId,
      file_type: fileType
    };
    return this.http
      .post(`${this.url}/${id}/download`, conditions, {
        params: params,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: csv下载租赁物件本金返还预计表数据
   * @return: 返回后台数据
   */
  downloadPrsCsv(
    datastore_id: string,
    jobId: string,
    params: {
      item_condition: {
        condition_list: Condition[];
        condition_type: string;
      };
    }
  ): Promise<any> {
    return this.http
      .post(`${this.urlPrs}/${datastore_id}/prs/download`, params, {
        params: {
          job_id: jobId
        },
        headers: {
          token: 'true'
        },
        responseType: 'blob'
      })
      .toPromise();
  }
}
