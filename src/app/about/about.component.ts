import { Component, OnInit } from '@angular/core';
import {DataService} from "../services/data.service";
import {ActivatedRoute, Params} from "@angular/router";
import {Subscription} from "rxjs/Rx";

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit{

  data = [];
  isLoading:boolean = true;
  fileName:string ="";
  routeSubscription: Subscription;

  constructor(
      private dataService: DataService,
      private _route: ActivatedRoute) { }

  ngOnInit() {
    this.routeSubscription = this._route.params.subscribe((params: Params) => {
      this.fileName = params["file"];
      this.getData();
    });
  }

  getData() {
    this.dataService.getData().subscribe(
        data => this.data = data,
        error => console.log(error),
        () => this.isLoading = false
    );
  }

}
