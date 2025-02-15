/*
 * @Description: app服务管理
 * @Author: RXC 廖欣星
 * @Date: 2019-05-23 11:12:56
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2020-05-20 09:11:25
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  // 设置全局url
  private url = 'app/user/apps';
  private appUrl = 'app/apps';

  constructor(private http: HttpClient) {}

  /**
   * @description: 获取用户所有APP
   */
  getUserApps(): Promise<any> {
    return this.http
      .get(this.url, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: アプリIDによりアプリ取得
   * @return: リクエストの結果
   */
  getAppByID(id: string, db: string): Promise<any> {
    return this.http
      .get(`${this.appUrl}/${id}`, {
        params: {
          database: db
        },
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }

  /**
   * @description: 更新月次设定
   */
  modifySwkSetting(
    id: string,
    params: {
      app_id: string;
      handleMonth: string;
      swk_control: boolean;
      confim_method: string;
    }
  ): Promise<any> {
    return this.http
      .put(`${this.appUrl}/${id}/swkSetting`, params, {
        headers: {
          token: 'true'
        }
      })
      .toPromise();
  }
}
