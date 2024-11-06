import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { DatastoreService } from '@api';

@Injectable({
  providedIn: 'root'
})
export class DatabaseResolverService implements Resolve<string> {
  constructor(private ds: DatastoreService) {}

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<string> {
    let name = '';
    await this.ds.getDatastoreByID(route.paramMap.get('d_id')).then((data: any) => {
      if (data) {
        name = data.datastore_name;
      }
    });
    return name;
  }
}
