import { Component, OnInit } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { ExploreChartService } from 'src/app/services/explore-chart/explore-chart.service';
import { ExploreDataService } from 'src/app/services/explore-data/explore-data.service';

@Component({
  selector: 'app-retention-chart',
  templateUrl: './retention-chart.component.html',
  styleUrls: ['./retention-chart.component.scss']
})
export class RetentionChartComponent implements OnInit {
  churnRateInsightsChart: Chart = Chart.prototype;

  constructor(private exploreDataService: ExploreDataService,
    private exploreChartService: ExploreChartService) { }

  ngOnInit(): void {
    this.exploreDataService.getRetentionChurnRateInsightsChart().subscribe(result => {
      const retentionChartData = new Map<string, Map<string, number[]>>();
      result.forEach(m => {        
        const key = Object.keys(m)[0];
        const innerMap = new Map<string, number[]>();
        m[key].forEach(n => {
          const innerKey = Object.keys(n)[0];
          innerMap.set(innerKey, n[innerKey]);
        })
        retentionChartData.set(key, innerMap);
      });
      this.churnRateInsightsChart = this.exploreChartService.getchurnRateInsightsChart(retentionChartData)
    });
  }

}
