/*
 * @Description: 字段服务管理
 * @Author: RXC 廖欣星
 * @Date: 2019-05-16 16:31:32
 * @LastEditors: RXC 陳平
 * @LastEditTime: 2020-06-23 16:35:47
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JournalService {
  constructor(private http: HttpClient) {}

  /**
   * @description: 获取分录
   * @return: 返回后台数据
   */
  getJournals(): Promise<any> {
    return this.http
      .get(`journal/journals`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 获取分录
   * @return: 返回后台数据
   */
  updateJournal(
    journalId: string,
    param: {
      pattern_id: string;
      subject_key: string;
      lending_division?: string;
      subject_name?: string;
      amount_name?: string;
      amount_field?: string;
    }
  ): Promise<any> {
    return this.http
      .put(`journal/journals/${journalId}`, param, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
  /**
   * @description: 获取分录
   * @return: 返回后台数据
   */
  computeJournal(section?: string): Promise<any> {
    const query = {};
    if (section) {
      query['section'] = section;
    }
    return this.http
      .get(`journal/compute/journals`, {
        params: query,
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 查找分录作成数据
   * @return: 返回后台数据
   */
  getSakuseiData(): Promise<any> {
    return this.http
      .get(`journal/journals/findSakuseiData`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 分录确定
   * @return: 返回后台数据
   */
  journalConfim(): Promise<any> {
    return this.http
      .get(`journal/journals/confim`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 添加分录出力设定
   * @return
   */
  addDownloadSetting(param: any): Promise<any> {
    return this.http
      .post(`journal/download/setting`, param, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 获取分录出力设定
   * @return: 返回后台数据
   */
  findDownloadSetting(appId: string): Promise<any> {
    return this.http
      .get(`journal/download/find`, {
        params: {
          appId: appId
        },
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 分录下载
   * @return
   */
  swkDownload(): Promise<any> {
    return this.http
      .get(`journal/download`, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
