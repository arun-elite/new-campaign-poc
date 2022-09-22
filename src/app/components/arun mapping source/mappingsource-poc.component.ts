import { Component, OnInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { EndpointMappingSourceService } from '../../services/endpoint-mapping-source.service';
import { SsoAuthService } from 'src/app/shared/services/sso-auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/sys-admin/services/common.service';
import { TranslateService } from 'src/app-services/translate.service';
declare var require: any;
const $: any = require('jquery');
import * as _ from 'lodash';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-mappingsource-poc',
  templateUrl: './mappingsource-poc.component.html',
  styleUrls: ['./mappingsource-poc.component.scss']
})
export class MappingsourcePocComponent implements OnInit {
  language: any;
  pageAvailable: boolean = false;
  load: boolean = false;

  public selectList: any = [];
  public unselectList: any = [];
  public edit: boolean = false;
  public showTab: boolean = false;
  currentRuleData: any;
  sbscbrCurrentRuleData: any;
  ruleName: any;

  mpngRuleObj: any = {};
  mpnPrcdnce: any = [];
  sbscbrRuleObj: any = {};
  sbscbrselectList: any = [];
  unsbscbrselectList: any = [];
  aggregationRuleObj = {};
  aggregationRuleFields: any = [];
  aggregationCurrentRuleData: any;
  aggregationMatchRules: any = {
    DHCP: [],
    AA: [],
    CUSTOM: [],
    SMx: [],
    DHCP_DELIMITER: '',
    AA_DELIMITER: '',
    CUSTOM_DELIMITER: '',
    SMx_DELIMITER: ''
  };
  aggregationRuleFieldsLength = 0;

  mappingRuleFields: any = [
    'MAC Address', 'Serial Number', 'Registration Id', 'Phone', 'account', 'Region', 'Network AID', 'Port Type', 'Subscriber Info', 'Subscriber Description', 'Additional Info', 'B-RAS IP', 'Router Interface', 'VLAN', 'DSLAM Node', 'DSLAM Vendor'
  ];

  customMappingRules = ['Name'];

  mpngRuleObjDefault: any = {
    "DHCP": ["dhcpCircuitId", "dhcpRemoteId", "dhcpClientHostName", 'macAddress', "dhcpSubscriberId"],
    "RADIUS": ["radiusUserName"],
    "CC": ["serialNumber", "subscriberName", "registrationId", "subscriberAccount"],
    "AA": ["macAddress", "cmSerialNumber", "cmRegistrationId", "cmPhone", "cmRegion", "cmMappedName", "cmNetworkName", "cmDeviceType", "cmNetworkAid", "cmPortType", "cmSubscriberInfo", "cmSubscriberDesc", "cmBrasIp", "cmRouterIf", "cmOrgSpecific", "cmVlan", "cmDslamNode", "cmDslamVendor"],
    "CUSTOM": ["cmSerialNumber", "cmRegistrationId", "cmAccount", "cmPhone", "cmRegion", "cmMappedName", "cmNetworkName", "cmDeviceType", "cmNetworkAid", "cmPortType", "cmSubscriberInfo", "cmSubscriberDesc", "cmBrasIp", "cmRouterIf", "cmOrgSpecific", "cmVlan", "cmDslamNode", "cmDslamVendor"],
    "RDNS": ["cmRegistrationId", "cmPhone", "cmRegion", "cmMappedName", "cmNetworkName", "cmDeviceType", "cmNetworkAid", "cmPortType", "cmSubscriberInfo", "cmSubscriberDesc", "cmBrasIp", "cmRouterIf", "cmOrgSpecific", "cmVlan", "cmDslamNode", "cmDslamVendor"],
    "MAC": ["cmRegistrationId", "cmPhone", "cmRegion", "cmMappedName", "cmNetworkName", "cmDeviceType", "cmNetworkAid", "cmPortType", "cmSubscriberInfo", "cmSubscriberDesc", "cmBrasIp", "cmRouterIf", "cmOrgSpecific", "cmVlan", "cmDslamNode", "cmDslamVendor"],
    "ASSIGNED": ["assignedName"],
    "CMS": ["cmSerialNumber", "cmRegistrationId", "cmPhone", "cmRegion", "cmMappedName", "cmNetworkName", "cmDeviceType", "cmNetworkAid", "cmPortType", "cmSubscriberInfo", "cmSubscriberDesc", "cmBrasIp", "cmRouterIf", "cmOrgSpecific", "cmVlan", "cmDslamNode", "cmDslamVendor"],
    "STATIC": [],
    "FA": ["cmRegistrationId", "cmPhone", "cmRegion", "cmMappedName", "cmNetworkName", "cmDeviceType", "cmNetworkAid", "cmPortType", "cmSubscriberInfo", "cmSubscriberDesc", "cmBrasIp", "cmRouterIf", "cmOrgSpecific", "cmVlan", "cmDslamNode", "cmDslamVendor"],
    "AXOS": ["ipAddress", "macAddress", "cmSerialNumber"],
    "EXA": ["ipAddress", "macAddress", "cmSerialNumber"],
    "SMx": ["cmSerialNumber", "cmRegistrationId", "cmAccount", "cmPhone", "cmRegion", "cmMappedName", "cmNetworkName", "cmDeviceType", "cmNetworkAid", "cmPortType", "cmSubscriberInfo", "cmSubscriberDesc", "cmBrasIp", "cmRouterIf", "cmOrgSpecific", "cmVlan", "cmDslamNode", "cmDslamVendor"]
  };


  aggregationRuleObjDefault = {
    "AA": ["cmSerialNumber", "cmRegistrationId", "cmPhone", "cmRegion", "cmMappedName", "cmNetworkName", "cmDeviceType", "cmNetworkAid", "cmPortType", "cmSubscriberInfo", "cmSubscriberDesc", "cmBrasIp", "cmRouterIf", "cmOrgSpecific", "cmVlan", "cmDslamNode", "cmDslamVendor"],
    "CUSTOM": ["cmSerialNumber", "cmRegistrationId", "cmPhone", "cmRegion", "cmMappedName", "cmNetworkName", "cmDeviceType", "cmNetworkAid", "cmPortType", "cmSubscriberInfo", "cmSubscriberDesc", "cmBrasIp", "cmRouterIf", "cmOrgSpecific", "cmVlan", "cmDslamNode", "cmDslamVendor"],
    "SMx": ["cmSerialNumber", "cmRegistrationId", "cmPhone", "cmRegion", "cmMappedName", "cmNetworkName", "cmDeviceType", "cmNetworkAid", "cmPortType", "cmSubscriberInfo", "cmSubscriberDesc", "cmBrasIp", "cmRouterIf", "cmOrgSpecific", "cmVlan", "cmDslamNode", "cmDslamVendor"]
  };

  delimiters = [
    '_',
    '-',
    '/',
    '~',
    '#'
  ];
  delimiterSelected = '_';
  aggregationdelimiterSelected = '_';

  allPrcdns = ["DHCP", "RADIUS", "CC", "AA", "CUSTOM", "RDNS", "MAC", "ASSIGNED", "STATIC", "AXOS", "EXA", "SMx"];
  mappingRuleFieldsLength = 0;
  sbscbrRuleFieldsLength = 0;
  subscriberMatchRules: any = [];

  sbscbrRuleFields: any = [
    'MAC Address', 'Serial Number', 'Registration Id', 'Phone', 'account', 'Region', 'Network AID', 'Port Type', 'Subscriber Info', 'Subscriber Description', 'Additional Info', 'B-RAS IP', 'Router Interface', 'VLAN', 'DSLAM Node', 'DSLAM Vendor'
  ];

  sbscbrRuleObjDefault = {
    "DHCP": ["ip_address", "mac_address", "dhcp_circuit_id", "dhcp_client_host_name", "dhcp_remote_id", "dhcp_subscriber_id"],
    "RADIUS": ["ip_address", "mac_address", "radius_user_name"],
    "CC": ["ip_address", "mac_address", "cc_server_info_id", "cc_cpe_id", "serial_number", "registration_id", "provisioning_code", "persistent_data", "subscriber_type", "subscriber_name", "subscriber_account", "sxa_cc_subscriber_id", "subscriber_phone", "email"],
    "AA": ["ip_address", "mac_address", "cmRegistrationId", "cmPhone", "cmRegion", "cmMappedName", "cmNetworkName", "cmDeviceType", "cmNetworkAid", "cmPortType", "cmSubscriberInfo", "cmSubscriberDesc", "cmBrasIp", "cmRouterIf", "cmOrgSpecific", "vlan", "cmDslamNode", "cmDslamVendor"],
    "CUSTOM": ["ip_address", "mac_address", "cm_serial_number", "cm_registration_id", "cm_mapped_name", "cm_address", "cm_phone", "cm_email", "cm_account", "cm_region", "cm_network_name", "cm_device_type", "cm_network_aid", "cm_port_type", "cm_subscriber_info", "cm_subscriber_desc", "cm_org_specific", "cm_alt_title", "cm_bras_ip", "cm_router_intf", "cm_vlan", "cm_dslam_node", "cm_dslam_vendor"],
    "RDNS": ["ip_address", "mac_address", "cm_serial_number", "cm_registration_id", "cm_mapped_name", "cm_address", "cm_phone", "cm_email", "cm_account", "cm_region", "cm_network_name", "cm_device_type", "cm_network_aid", "cm_port_type", "cm_subscriber_info", "cm_subscriber_desc", "cm_org_specific", "cm_alt_title", "cm_bras_ip", "cm_router_intf", "cm_vlan", "cm_dslam_node", "cm_dslam_vendor"],
    "MAC": ["ip_address", "mac_address", "cm_serial_number", "cm_registration_id", "cm_mapped_name", "cm_address", "cm_phone", "cm_email", "cm_account", "cm_region", "cm_network_name", "cm_device_type", "cm_network_aid", "cm_port_type", "cm_subscriber_info", "cm_subscriber_desc", "cm_org_specific", "cm_alt_title", "cm_bras_ip", "cm_router_intf", "cm_vlan", "cm_dslam_node", "cm_dslam_vendor"],
    "ASSIGNED": ["ip_address", "mac_address", "assigned_name"],
    "CMS": ["ip_address", "mac_address", "cm_serial_number", "cm_registration_id", "cm_mapped_name", "cm_address", "cm_phone", "cm_email", "cm_account", "cm_region", "cm_network_name", "cm_device_type", "cm_network_aid", "cm_port_type", "cm_subscriber_info", "cm_subscriber_desc", "cm_org_specific", "cm_alt_title", "cm_bras_ip", "cm_router_intf", "cm_vlan", "cm_dslam_node", "cm_dslam_vendor"],
    "STATIC": ["ip_address", "mac_address",],
    "FA": ["ip_address", "mac_address", "cm_serial_number", "cm_registration_id", "cm_mapped_name", "cm_address", "cm_phone", "cm_email", "cm_account", "cm_region", "cm_network_name", "cm_device_type", "cm_network_aid", "cm_port_type", "cm_subscriber_info", "cm_subscriber_desc", "cm_org_specific", "cm_alt_title", "cm_bras_ip", "cm_router_intf", "cm_vlan", "cm_dslam_node", "cm_dslam_vendor"],
    "SMx": ["ip_address", "mac_address", "cm_serial_number", "cm_registration_id", "cm_mapped_name", "cm_address", "cm_phone", "cm_email", "cm_account", "cm_region", "cm_network_name", "cm_device_type", "cm_network_aid", "cm_port_type", "cm_subscriber_info", "cm_subscriber_desc", "cm_org_specific", "cm_alt_title", "cm_bras_ip", "cm_router_intf", "cm_vlan", "cm_dslam_node", "cm_dslam_vendor"]
  };

  sbscbrallPrcdns = ["DHCP", "RADIUS", "CC", "AA", "CUSTOM", "RDNS", "MAC", "ASSIGNED", "CMS", "FA", "STATIC"];

  title = {
    "cmSerialNumber": "Serial Number",
    "dhcp_circuit_id": "DHCP Circuit Id",
    "dhcp_client_host_name": "DHCP Client Hostname",
    "dhcp_remote_id": "DHCP Remote Id",
    "dhcp_subscriber_id": "DHCP Subscriber Id",
    "serial_number": "Serial Number",
    "dhcpCircuitId": "DHCP Circuit Id",
    "dhcpRemoteId": "DHCP Remote Id",
    "dhcpClientHostName": "DHCP Client Hostname",
    "dhcpSubscriberId": "DHCP Subscriber Id",
    "radiusUserName": "Radius Username",
    "serialNumber": "Serial Number",
    "subscriberName": "SubscriberName",
    "registrationId": "Registration Id",
    "subscriberAccount": "Location_ID",
    "cmRegistrationId": "Registration Id",
    "cmPhone": "Phone",
    "cmRegion": "Region",
    "cmMappedName": "Mapped Name",
    "cmNetworkName": "Network Name",
    "cmDeviceType": "Device Type",
    "cmNetworkAid": "Network AID",
    "cmPortType": "Port Type",
    "cmSubscriberInfo": "Subscriber Info",
    "cmSubscriberDesc": "Subscriber Description",
    "cmBrasIp": "B-RAS IP",
    "cmRouterIf": "Router Interface",
    "cmOrgSpecific": "Org Specific",
    "vlan": "VLAN",
    "cmDslamNode": "DSLAM Node",
    "cmDslamVendor": "DSLAM Vendor",
    "assigned_name": "Assigned Name",
    "DHCP": "DHCP",
    "RADIUS": "RADIUS",
    "CC": "Consumer Connect",
    "AA": "Access Analyze",
    "CUSTOM": "Custom",
    "RDNS": "RDNS",
    "MAC": "MAC",
    "ASSIGNED": "ASSIGNED",
    "CMS": "CMS",
    "FA": "FLOW ANALYZE",
    "STATIC": "",
    "ip_address": "Ip Address",
    "mac_address": "MAC Address",
    "cm_serial_number": "Serial Number",
    "cm_registration_id": "Registration Id",
    "cm_mapped_name": "Mapped Name",
    "cm_address": "Address",
    "cm_phone": "Phone",
    "cm_email": "Email",
    "cm_account": "Account",
    "cm_region": "Region",
    "cm_network_name": "Network Name",
    "cm_device_type": "Device Type",
    "cm_network_aid": "Network Aid",
    "cm_port_type": "Port Type",
    "cm_subscriber_info": "Subscriber Info",
    "cm_subscriber_desc": "Subscriber Desc",
    "cm_org_specific": "Org Specific",
    "cm_alt_title": "Alt Title",
    "cm_bras_ip": "B-RAS IP",
    "cm_router_intf": "Router Interface",
    "cm_vlan": "VLAN",
    "cm_dslam_node": "DSLAM Node",
    "cm_dslam_vendor": "DSLAM Vendor",
    "radius_user_name": "Radius User Name",
    "cc_server_info_id": "Server Info Id",
    "cc_cpe_id": "CPE Id",
    "registration_id": "Registration Id",
    "provisioning_code": "Provisioning Code",
    "persistent_data": "Persistent Data",
    "subscriber_type": "Subscriber Type",
    "subscriber_name": "Subscriber Name",
    "subscriber_account": "Location_ID",
    "sxa_cc_subscriber_id": "Subscriber Id",
    "subscriber_phone": "Subscriber Phone",
    "email": "Email",
    "macAddress": "MAC Address",
    "cmVlan": "VLAN",
    "assignedName": "Assigned Name",
    "cmAccount": "Account",
    "AXOS": "AXOS",
    "EXA": "EXA",
    "ipAddress": "Ip Address"
  };

  ORG_ID: string;
  loaded: boolean;
  @ViewChild('infoModal', { static: true }) private infoModal: TemplateRef<any>;
  @ViewChild('aggregWarningModal', { static: true }) private aggregWarningModal: TemplateRef<any>;
  infoTitle: any;
  infoBody: any;

  emptyRule: any = [
    {
      attrs: [],
      delimiter: ""
    }
  ];
  loading: boolean = true;
  modalRef: any;
  translateSubscribe: any;
  saveSubs: any;
  createOrgSubs: any;
  updateSubs: any;
  deleteSubs: any;
  latestAggreData: any;
  latestAggreDataDeLimit: string;

  showKeyConfig: boolean;
  keyConfigDefaultObj: any = {
    macAddress: false,
    remoteId: false,
    circuitId: false,
    subscriberId: false,
    clientHostName: false
  };

  keyConfigEditObj: any = {};
  keyConfigEditBFRObj: any = {};
  keyConfigSubs: any;
  keyConfigs: any = {};
  addKeyConfigSusbs: any;
  showSubsRule: boolean;
  isDev: boolean;
  private isProd = false;
  private module: string



  //poc
  PrecedenceData: any;
  entitlement: any;
  FormatData: any = [];
  new: boolean = true;
  showAggregation = false;

  constructor(
    private service: EndpointMappingSourceService,
    private sso: SsoAuthService,
    private router: Router,
    private dialogService: NgbModal,
    private commonOrgService: CommonService,
    private translateService: TranslateService,
    private titleService: Title
  ) {
    let url = this.router.url;
    this.ORG_ID = this.sso.getOrganizationID(url);
    this.entitlement = this.sso.getEntitlements();

    this.language = this.translateService.defualtLanguage;
    if (this.language) {
      this.pageAvailable = true
    }
    this.translateSubscribe = this.translateService.selectedLanguage.subscribe(data => {
      this.language = data;
      this.getListOfData();
      this.titleService.setTitle(`${this.language['mappingsource']} - ${this.language['end']} - ${this.language['flowconfiguration']} - ${this.module === 'systemAdministration' ? this.language['System Administration'] : this.language.administration} - ${this.language['Calix Cloud']}`);
    });

    this.commonOrgService.closeAlert();
    this.isDev = this.sso.isDevCheckFromBaseURL();
    this.isProd = this.sso.isProdCheckFromBaseURL();
    this.module = this.sso.getRedirectModule(url);
    this.titleService.setTitle(`${this.language['mappingsource']} - ${this.language['end']} - ${this.language['flowconfiguration']} - ${this.module === 'systemAdministration' ? this.language['System Administration'] : this.language.administration} - ${this.language['Calix Cloud']}`);

    if (this.module !== 'systemAdministration') {
      let entitlement = this.sso.getEntitlements();
      if (entitlement && !entitlement[102]) {
        this.allPrcdns = this.allPrcdns.filter(ele => !["AXOS", "EXA"].includes(ele));
      }
    }

  }

  ngOnInit() {
    this.getListOfData();
  }
  

  ngOnDestroy(): void {
    if (this.translateSubscribe) {
      this.translateSubscribe.unsubscribe();
    }
   
    if (this.saveSubs) {
      this.saveSubs.unsubscribe();
    }
    if (this.createOrgSubs) {
      this.createOrgSubs.unsubscribe();
    }
    if (this.updateSubs) {
      this.updateSubs.unsubscribe();
    }
    if (this.deleteSubs) {
      this.deleteSubs.unsubscribe();
    }
    if (this.keyConfigSubs) this.keyConfigSubs.unsubscribe();
    if (this.addKeyConfigSusbs) this.addKeyConfigSusbs.unsubscribe();
  }

  editMapping(): void {
    this.edit = true;
  }

  addItemTolist(item: any): void {
    this.selectList.push(item);
    let myArray = this.unselectList.filter(function (obj) {
      return obj.id !== item.id;
    });
    this.unselectList = myArray;
  }

  cancel(): void {
    this.edit = false;
  }

  cancelWithGet(): void {
    this.selectList = []
    this.cancel();
    this.getListOfData();
  }

  addItemToMappingRule(name?: string, index?: any, field?: any): void {
    if (!this.mpngRuleObj[name]) {
      this.mpngRuleObj[name] = {
        data: [],
        key: name,
        name: name,
        rules: [
          { attrs: [], delimiter: '' }
        ]
      };
    } else if (this.mpngRuleObj[name] && !this.mpngRuleObj[name]?.rules?.length) {
      this.mpngRuleObj[name].rules.push({ attrs: [], delimiter: '' });
    }
    let data = this.mpngRuleObj[name];
    data.rules[index].attrs.push(field);
    if (data.rules[index].attrs && data.rules[index].attrs.length == 2) {
      data.rules[index].delimiter = '_';
    }
    this.mpngRuleObj[name] = data;
    this.currentRuleData = data;
    let fields = this.mappingRuleFields;
    let fI = fields.indexOf(field);
    fields.splice(fI, 1);
    this.mappingRuleFields = fields;

    this.mappingRuleFieldsLength = this.mappingRuleFields.length;

  }

  addItemToSbscbrMappingRule(name?: string, index?: any, field?: any): void {
    let data = this.sbscbrRuleObj[name];
    data.rules[index].attrs.push(field);
    this.sbscbrRuleObj[name] = data;
    this.sbscbrCurrentRuleData = data;
    let fields = this.sbscbrRuleFields;
    let fI = fields.indexOf(field);
    fields.splice(fI, 1);
    this.sbscbrRuleFields = fields;
    this.sbscbrRuleFieldsLength = this.sbscbrRuleFields.length;
    if (field && this.subscriberMatchRules.indexOf(field) === -1) {
      this.subscriberMatchRules.push(field);
    }

  }


  addItemToAggregationMappingRule(name?: string, index?: any, field?: any): void {
    let data = this.aggregationRuleObj[name];
    data.rules[index].attrs.push(field);
    if (data.rules[index].attrs && data.rules[index].attrs.length == 2) {
      this.aggregationdelimiterSelected = '_';
    }
    this.aggregationRuleObj[name] = data;
    this.sbscbrCurrentRuleData = data;
    let fields = this.aggregationRuleFields;
    let fI = fields.indexOf(field);
    fields.splice(fI, 1);
    this.aggregationRuleFields = fields;
    this.aggregationRuleFieldsLength = this.aggregationRuleFields.length;
    if (field && this.aggregationMatchRules[name].indexOf(field) === -1) {
      this.aggregationMatchRules[name].push(field);
    }
    this.aggregationMatchRules[`${name}_DELIMITER`] = this.aggregationdelimiterSelected;
  }

  changeAggregationDelimiter(name) {
    this.aggregationMatchRules[`${name}_DELIMITER`] = this.aggregationdelimiterSelected;
  }



  getCurrentRule(key: any): void {
    if (!this.mpngRuleObj[key]) {
      this.mpngRuleObj[key] = {
        data: [],
        key: key,
        name: key,
        rules: [
          { attrs: [], delimiter: '' }
        ]
      };
    }
    this.currentRuleData = this.mpngRuleObj[key];
    this.showTab = true;
    this.ruleName = key;
    let el = document.getElementById('sxa-color-gold-' + key) as HTMLElement;
    el.style.display = 'block';

    let rules = this.currentRuleData.rules;
    let fields = [...this.mpngRuleObjDefault[key]];

    for (let i = 0; i < rules.length; i++) {
      let attrs = rules[i].attrs;
      let delimit = rules[i].delimiter;
      if (delimit && !this.delimiters.includes(delimit)) {
        rules[i].delimiter = '_';
      }
      if (attrs.length) {
        for (let j = 0; j < attrs.length; j++) {
          let fI = fields.indexOf(attrs[j]);

          if (fI !== -1) {
            fields.splice(fI, 1);
          }

        }
      }

    }

    this.mappingRuleFields = fields;

    this.mappingRuleFieldsLength = this.mappingRuleFields.length;
    let attrs = [];
    fields = [];
    let sbscbrRuleFields = this.sbscbrRuleObjDefault[key] ? this.sbscbrRuleObjDefault[key] : [];
    this.showSubsRule = false;
    if (this.sbscbrRuleObjDefault[key]) {
      this.showSubsRule = true;
    }
    for (let i = 0; i < sbscbrRuleFields.length; i++) {
      if (this.subscriberMatchRules.indexOf(sbscbrRuleFields[i]) !== -1) {
        attrs.push(sbscbrRuleFields[i]);
      } else {
        fields.push(sbscbrRuleFields[i]);
      }
    }

    if (!this.sbscbrRuleObj[key]) {
      this.sbscbrRuleObj[key] = {
        data: [],
        key: key,
        name: key,
        rules: [
          { attrs: attrs, delimiter: '' }
        ]
      };
    } else {
      this.sbscbrRuleObj[key].rules[0].attrs = attrs;
    }
    this.sbscbrCurrentRuleData = this.sbscbrRuleObj[key];

    this.sbscbrRuleFields = fields;

    this.sbscbrRuleFieldsLength = this.sbscbrRuleFields.length;
    attrs = [];
    fields = [];
    Object.keys(this.aggregationRuleObjDefault).forEach(key => {
      this.aggregationRuleObj[key] = {
        data: [],
        key: key,
        name: key,
        rules: [
          { attrs: this.aggregationMatchRules[key], delimiter: '' }
        ]
      }
    })

    let aggregationRuleFields = this.aggregationRuleObjDefault[key]?.slice(0);
    if (aggregationRuleFields) {
      this.showAggregation = true;
      let rules = this.aggregationMatchRules[key] ? this.aggregationMatchRules[key] : [];
      fields = aggregationRuleFields;
      for (let i = 0; i < rules.length; i++) {
        if (fields.includes(rules[i])) {
          attrs.push(rules[i]);
          fields = fields.filter(el => el !== rules[i]);

        }
      }



      if (!this.aggregationRuleObj[key] && aggregationRuleFields) {
        this.aggregationRuleObj[key] = {
          data: [],
          key: key,
          name: key,
          rules: [
            { attrs: attrs, delimiter: '' }
          ]
        };
      } else {
        this.aggregationRuleObj[key].rules[0].attrs = attrs;
      }

      this.aggregationdelimiterSelected = this.aggregationMatchRules[`${key}_DELIMITER`] ? this.aggregationMatchRules[`${key}_DELIMITER`] : '_';

      this.aggregationCurrentRuleData = this.aggregationRuleObj[key];
      this.latestAggreData = this.aggregationCurrentRuleData ? _.cloneDeep(this.aggregationCurrentRuleData) : {};
      this.latestAggreDataDeLimit = this.aggregationdelimiterSelected;
      this.aggregationRuleFields = fields;

      this.aggregationRuleFieldsLength = this.aggregationRuleFields.length;
    } else {
      this.showAggregation = false;
      this.latestAggreData = undefined;
    }


    this.showTab = true;

    this.ruleName = key;

    if (key == 'DHCP') {

      if (this.keyConfigEditObj && !Object.keys(this.keyConfigEditObj).length) {
        this.keyConfigEditObj = _.cloneDeep(this.keyConfigDefaultObj);
      }
      this.keyConfigEditBFRObj = _.cloneDeep(this.keyConfigEditObj);
      this.showKeyConfig = true;
    } else {
      this.showKeyConfig = false;
    }



  }

  deleteAttr(ruleItem: any, index: any): any {
    let data = this.currentRuleData;

    let dI = data.rules[index].attrs.indexOf(ruleItem);
    data.rules[index].attrs.splice(dI, 1);

    if (data.rules[index].attrs && data.rules[index].attrs.length < 2) {
      data.rules[index].delimiter = '_';
    }

    this.currentRuleData = data;
    this.mpngRuleObj[this.ruleName] = data;

    this.mappingRuleFields.push(ruleItem);
    this.mappingRuleFields = Object.assign([], this.mappingRuleFields);

    this.mappingRuleFieldsLength = this.mappingRuleFields.length;

  }

  deleteSbscbrAttr(ruleItem: any, index: any): any {
    let data = this.sbscbrCurrentRuleData;

    let dI = data.rules[index].attrs.indexOf(ruleItem);
    data.rules[index].attrs.splice(dI, 1);

    this.sbscbrCurrentRuleData = data;
    this.sbscbrRuleObj[this.ruleName] = data;

    this.sbscbrRuleFields.push(ruleItem);
    this.sbscbrRuleFields = Object.assign([], this.sbscbrRuleFields);

    this.sbscbrRuleFieldsLength = this.sbscbrRuleFields.length;

    let smrIndex = this.subscriberMatchRules.indexOf(ruleItem);
    if (smrIndex > -1) {
      this.subscriberMatchRules.splice(smrIndex, 1);
    }


  }


  deleteAggregationAttr(ruleItem: any, index: any): any {
    let data = this.aggregationCurrentRuleData;

    let dI = data.rules[index].attrs.indexOf(ruleItem);
    data.rules[index].attrs.splice(dI, 1);

    if (data.rules[index].attrs && data.rules[index].attrs.length < 2) {
      this.aggregationdelimiterSelected = '_';
    }
    this.aggregationCurrentRuleData = data;
    this.aggregationRuleObj[this.ruleName] = data;

    this.aggregationRuleFields.push(ruleItem);
    this.aggregationRuleFields = Object.assign([], this.aggregationRuleFields);

    this.aggregationRuleFieldsLength = this.aggregationRuleFields.length;

    let smrIndex = this.aggregationMatchRules[data.name].indexOf(ruleItem);
    if (smrIndex > -1) {
      this.aggregationMatchRules[data.name].splice(smrIndex, 1);
    }


  }

  deleteRule(ruleName: any, index: any): any {
    let data = this.currentRuleData;
    let fields = [];
    if (data.rules[index].attrs) {
      for (let i = 0; i < data.rules[index].attrs.length; i++) {
        fields.push(data.rules[index].attrs[i]);
      }
    }

    this.mappingRuleFields = [...this.mappingRuleFields, ...fields];
    data.rules.splice(index, 1);

    this.currentRuleData = data;
    this.mpngRuleObj[this.ruleName] = data;

    this.mappingRuleFieldsLength = this.mappingRuleFields.length;

  }

  deleteSbscbrRule(ruleName: any, index: any): any {
    let data = this.sbscbrCurrentRuleData;
    let fields = [];
    if (data.rules[index].attrs) {
      for (let i = 0; i < data.rules[index].attrs.length; i++) {
        fields.push(data.rules[index].attrs[i]);
      }
    }

    this.sbscbrRuleFields = Array.prototype.push.apply(this.sbscbrRuleFields, fields);
    this.sbscbrRuleFields = Object.assign([], this.sbscbrRuleFields);
    data.rules.splice(index, 1);

    this.sbscbrCurrentRuleData = data;
    this.sbscbrRuleObj[this.ruleName] = data;

    this.sbscbrRuleFieldsLength = this.sbscbrRuleFields.length;

  }

  deleteMapping(item: any): any {
    let selectList = this.selectList;

    selectList = selectList.filter(function (obj: any) {
      return obj.name !== item.name;
    });

    this.selectList = selectList;

    let unselectList = this.unselectList;
    unselectList.push(item);
    this.unselectList = unselectList;
    if (this.mpngRuleObj[item.key]) delete this.mpngRuleObj[item.key];
  }

  openTab(): void {
    this.showTab = true;
  }

  closeTab(): void {
    this.cancelAggregationRuleApply();

  }

  applyAggregationRuleModalOpen(): void {

    if (this.aggregationCurrentRuleData && this.latestAggreData && (JSON.stringify(this.latestAggreData) !== JSON.stringify(this.aggregationCurrentRuleData) || (this.latestAggreDataDeLimit && this.latestAggreDataDeLimit !== this.aggregationdelimiterSelected))) {
      this.closeModal();
      this.modalRef = this.dialogService.open(this.aggregWarningModal);
    } else if (this.ruleName && this.ruleName == 'DHCP' && !_.isEqual(this.keyConfigEditBFRObj, this.keyConfigEditObj) && this.mpnPrcdnce.includes('DHCP')) {
      this.closeModal();
      this.modalRef = this.dialogService.open(this.aggregWarningModal);
    } else {
      this.showTab = false;
      let el = document.getElementById('sxa-color-gold-' + this.ruleName) as HTMLElement;
      if (el) {
        el.style.display = 'none';
      }
    }


  }

  confirmAggregationRuleApply(): void {
    this.showTab = false;
    let el = document.getElementById('sxa-color-gold-' + this.ruleName) as HTMLElement;
    if (el) {
      el.style.display = 'none';
    }
    this.closeModal();
  }

  cancelAggregationRuleApply() {
    let key = '';
    if (this.aggregationCurrentRuleData) {
      key = this.aggregationCurrentRuleData.key ? this.aggregationCurrentRuleData.key : '';
      if (key && this.latestAggreData) {
        this.aggregationCurrentRuleData.rules[0].attrs = this.latestAggreData.rules[0].attrs;
        this.aggregationMatchRules[key] = this.latestAggreData.rules[0].attrs;
        this.aggregationMatchRules[`${key}_DELIMITER`] = this.latestAggreDataDeLimit;
      }

      this.closeModal();
      setTimeout(() => {
        this.aggregationCurrentRuleData = undefined;
      }, 0);
    }


    if (this.ruleName && this.ruleName == 'DHCP') {
      this.keyConfigEditObj = _.cloneDeep(this.keyConfigEditBFRObj);
    }

    this.showTab = false;
    let el = document.getElementById('sxa-color-gold-' + this.ruleName) as HTMLElement;
    if (el) {
      el.style.display = 'none';
    }
  }

  addRule(name: any, item: any): void {
    let data = this.mpngRuleObj[name];

    data.rules.push({
      attrs: [item],
      delimiter: ''
    });

    this.mpngRuleObj[name] = data;

    this.currentRuleData = this.mpngRuleObj[name];

    let fields = this.mappingRuleFields;
    let fI = fields.indexOf(item);
    fields.splice(fI, 1);
    this.mappingRuleFields = fields;

    this.mappingRuleFieldsLength = this.mappingRuleFields.length;
  }

  addSbscbrRule(name: any, item: any): void {
    let data = this.sbscbrRuleObj[name];

    data.rules.push({
      attrs: [item],
      delimiter: ''
    });

    this.sbscbrRuleObj[name] = data;

    this.sbscbrCurrentRuleData = this.sbscbrRuleObj[name];

    let fields = this.sbscbrRuleFields;
    let fI = fields.indexOf(item);
    fields.splice(fI, 1);
    this.sbscbrRuleFields = fields;

    this.sbscbrRuleFieldsLength = this.sbscbrRuleFields.length;
  }

  dropMappingSource(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.selectList, event.previousIndex, event.currentIndex);
  }

  dropCurrentRuleData(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.currentRuleData.rules, event.previousIndex, event.currentIndex);
  }

  dropFiledToCurrentRuleData(event: CdkDragDrop<string[]>, index: number) {
    moveItemInArray(this.currentRuleData.rules[index].attrs, event.previousIndex, event.currentIndex);
  }

  dropFieledToCurrentAggreRuleData(event: CdkDragDrop<string[]>, index: number) {
    moveItemInArray(this.aggregationCurrentRuleData.rules[index].attrs, event.previousIndex, event.currentIndex);
  }

  changeDelimiter(event, index: number) {
    let data = this.currentRuleData;
  }


  checkFieldsLength(name?: string, index?: any, field?: any) {

    let data = this.mpngRuleObj[name];

    if (data.rules[index].attrs.length > 1) {
      return true;
    }

    return false;
  }

  checkSbscbrFieldsLength(name?: string, index?: any, field?: any) {
    let data = this.sbscbrRuleObj[name];
    if (data.rules[index].attrs.length > 1) {
      return true;
    }
    return false;
  }

  checkAggreFieldsLength(name?: string, index?: any, field?: any) {
    let data = this.aggregationRuleObj[name];
    if (data && data?.rules[index]?.attrs.length > 1) {
      return true;
    }
    return false;
  }

  getListOfData() {
    let selectedData = [];
    let selectPrecedence = [];
    let unselectedData = [];
    let sampleData = [];
    this.service.getList(this.ORG_ID).subscribe((res) => {
      this.PrecedenceData = res.mappingPrecedence ? res.mappingPrecedence.split(',') : []
      this.FormatData = res.nameFormat ? JSON.parse(res.nameFormat) : [];
      if (res && Object.keys(res)) {
        if (this.module !== 'systemAdministration') {
          if (this.entitlement && !this.entitlement[102]) {
            this.PrecedenceData = this.PrecedenceData.filter(ele => !["AXOS", "EXA"].includes(ele))
          }
        }
        this.PrecedenceData = this.PrecedenceData.filter(el => el && el.toUpperCase() != 'CMS');
        this.PrecedenceData = this.PrecedenceData.filter(el => el && el.toUpperCase() != 'FA');
        this.PrecedenceData = this.PrecedenceData.filter(el => el && (el.toUpperCase() != 'AXOS' || el.toUpperCase() != 'EXA'));
        let elementDHCP = this.PrecedenceData.filter(el => el && el.toUpperCase() == 'DHCP').length;
        if (elementDHCP) {
          this.getKeyConfigurations();
        } else {
          this.resetKeyConfigurations();
        }
        if (this.FormatData) {
          console.log(this.FormatData)
          let data = this.FormatData
          if (this.module !== 'systemAdministration') {
            if (this.entitlement && !this.entitlement[102]) {
              this.FormatData = this.FormatData.filter(ele => !["AXOS", "EXA"].includes(ele.name));
            }
          }
          for (let i = 0; i < data.length; i++) {
            if (data[i].name && data[i].name == 'CMS') continue;
            if (data[i].name && data[i].name == 'FA') continue;
            data[i].data = [];
            for (let j = 0; j < data[i].rules.length; j++) {
              let idata = [];
              for (let k = 0; k < data[i].rules[j].attrs.length; k++) {
                idata.push(this.language[this.title[data[i].rules[j].attrs[k]]] || this.title[data[i].rules[j].attrs[k]]);
              }
              data[i].data.push(idata.join(data[i].rules[j].delimiter));
            }
            data[i].key = data[i].name;
            this.mpngRuleObj[data[i].name] = data[i];
            selectedData.push(data[i]);
            selectPrecedence.push(data[i].name);
          }
          if (this.PrecedenceData.length && !this.FormatData.length) {
            for (let i = 0; i < this.PrecedenceData.length; i++) {
              selectedData.push({
                name: this.PrecedenceData[i],
                rules: this.emptyRule,
                key: this.PrecedenceData[i],
                data: []
              });
              selectPrecedence.push(this.PrecedenceData[i]);
            }
          }
          else if (this.PrecedenceData.length && this.FormatData.length && this.PrecedenceData.length != this.FormatData.length) {
            let srcs = this.PrecedenceData;
            for (let x = 0; x < this.PrecedenceData.length; x++) {
              if (this.FormatData.filter((el) => el.name == this.PrecedenceData[x]).length) {
                srcs = srcs.filter((src) => src !== this.PrecedenceData[x]);
              }
            }

            if (srcs.length) {
              for (let y = 0; y < srcs.length; y++) {
                selectedData.push({
                  name: srcs[y],
                  rules: this.emptyRule,
                  key: srcs[y],
                  data: []
                });
                selectPrecedence.push(srcs[y]);
              }
            }
          }
          else if (!this.PrecedenceData.length && !this.FormatData.length) {
            this.resetMappingRuleObj();
          }
        }
        else {
          if (this.PrecedenceData.length) {
            for (let i = 0; i < this.PrecedenceData.length; i++) {
              selectedData.push({
                name: this.PrecedenceData[i],
                rules: this.emptyRule,
                key: this.PrecedenceData[i],
                data: []
              });
              selectPrecedence.push(this.PrecedenceData[i]);
            }
          } else {
            this.resetMappingRuleObj();

          }
        }
        if (selectedData && selectedData.length) {
          selectedData = this.makeOrderByMapPrecedence(selectedData, this.mpnPrcdnce);
        }
        this.selectList = selectedData;
        this.selectList = [...this.selectList];
        if (selectedData.length) {
          this.new = false;
        }

        for (let i = 0; i < this.allPrcdns.length; i++) {
          if (selectPrecedence.indexOf(this.allPrcdns[i]) === -1) {
            unselectedData.push({
              id: i + 1,
              name: this.allPrcdns[i],
              data: [
                'Name'
              ],
              key: this.allPrcdns[i]
            });
          }
        }
        this.unselectList = unselectedData;
        if (res.subscriberMatchRule) {
          sampleData = res.subscriberMatchRule.split(',');
        } else {
          sampleData = [];
        }
        this.subscriberMatchRules = sampleData;
        if (!selectedData.length) {
          for (let i = 0; i < this.allPrcdns.length; i++) {
            unselectedData.push({
              id: i + 1,
              name: this.allPrcdns[i],
              data: [
                'Name'
              ],
              key: this.allPrcdns[i]
            });
          }
          this.unselectList = unselectedData.filter((tag, index, array) => array.findIndex(t => t.id == tag.id) == index);
        }

        if (res.aggregationRules) {
          let data = JSON.parse(res.aggregationRules);
          data = data.filter(el => el.name != 'DHCP');
          for (let i = 0; i < data.length; i++) {
            data[i].data = [];
            let idata = [];
            for (let k = 0; k < data[i].attrs.length; k++) {
              idata.push(data[i].attrs[k]);
            }
            this.aggregationMatchRules[data[i].name] = idata;
            this.aggregationMatchRules[`${data[i].name}_DELIMITER`] = data[i].delimiter ? data[i].delimiter : '';
          }
          if (!data.length) {
            Object.keys(this.aggregationRuleObjDefault).forEach(key => {
              this.aggregationMatchRules[key] = []
            });
          }
          Object.keys(this.aggregationRuleObjDefault).forEach(key => {
            this.aggregationRuleObj[key] = {
              data: [],
              key: key,
              name: key,
              rules: [
                { attrs: this.aggregationMatchRules[key], delimiter: '' }
              ]
            }
          })
        }

      }
      else {
        for (let i = 0; i < this.allPrcdns.length; i++) {
          unselectedData.push({
            id: i + 1,
            name: this.allPrcdns[i],
            data: [
              'Name'
            ],
            key: this.allPrcdns[i]
          });
        }

        this.unselectList = unselectedData;
        this.new = true;
      }
      setTimeout(() => {
        this.loading = false;
      }, 1000);
    }, (err: HttpErrorResponse) => {
      if (err.status == 404) {
        this.new = true;
        this.loading = false;
      } else {
        this.pageErrorHandle(err);
      }
    })
  }




  save(): any {
    let mpngPrcdnc = [];
    let nameFormat = [];
    let sbscrbrMR = [];
    let noRuleMSCounts = 0;
    let noRuleMSources: any = [];

    for (let i = 0; i < this.selectList.length; i++) {
      mpngPrcdnc.push(this.selectList[i].name);
      let nData = _.cloneDeep(this.mpngRuleObj[this.selectList[i].name]);
      if (nData) {
        delete nData.data;
        delete nData.key;
        if (nData && nData.rules.length) {
          nData.rules = nData.rules.filter(rule => (rule.attrs && rule.attrs.length));
          if (nData.rules.length) nameFormat.push(nData);
        }
      }

      let sData = this.sbscbrRuleObj[this.selectList[i].name];
      if (sData) {
        delete sData.data;
        delete sData.key;
        sbscrbrMR.push(sData);
      }

    }


    mpngPrcdnc.forEach((el) => {
      const matchMS = nameFormat.filter(nf => (nf.name && el && nf.name === el));
      if (!matchMS.length) {
        noRuleMSources.push(el);
        noRuleMSCounts++;

      }
    });

    if (noRuleMSCounts && !(noRuleMSCounts === 1 && noRuleMSources[0] === 'STATIC')) {
      this.infoBody = this.language["Please select at least one Mapping Rule for selected Mapping Sources"];
      this.infoTitle = this.language['Invalid Request'];
      this.openInfoModal();
      return;
    }

    let aggregationKeys = Object.keys(this.aggregationRuleObj);
    let aggregationRules = [];
    if (aggregationKeys) {
      for (let i = 0; i < aggregationKeys.length; i++) {
        let data = {
          name: aggregationKeys[i],
          attrs: this.aggregationRuleObj[aggregationKeys[i]].rules[0].attrs,
          delimiter: this.aggregationMatchRules[`${aggregationKeys[i]}_DELIMITER`] ? this.aggregationMatchRules[`${aggregationKeys[i]}_DELIMITER`] : ''
        }
        if (data.attrs && data.attrs.length) aggregationRules.push(data);

      }
    }

    let data = {
      mappingPrecedence: mpngPrcdnc.join(','),
      nameFormat: JSON.stringify(nameFormat),
      orgId: this.ORG_ID,
      subscriberMatchRule: this.subscriberMatchRules ? this.subscriberMatchRules.join(',') : '',
      aggregationRules: JSON.stringify(aggregationRules),
      tenantId: 0
    };

    this.loading = true;
    if (this.new) {
      let newDt = data;
      if (!nameFormat.length) {
        delete newDt.nameFormat;
      }
      if (newDt.subscriberMatchRule == '') {
        delete newDt.subscriberMatchRule;
      }

      this.saveSubs = this.service.save(newDt, this.ORG_ID).subscribe((json: any) => {
        if (data.mappingPrecedence.indexOf('DHCP') !== -1) {
          let config = (this.keyConfigEditObj && Object.keys(this.keyConfigEditObj).length) ? this.keyConfigEditObj : this.keyConfigDefaultObj;
          let params = {
            macAddress: config.macAddress ? config.macAddress : false,
            remoteId: config.remoteId ? config.remoteId : false,
            circuitId: config.circuitId ? config.circuitId : false,
            subscriberId: config.subscriberId ? config.subscriberId : false,
            clientHostName: config.clientHostName ? config.clientHostName : false
          }
          this.addKeyConfigSusbs = this.service.addDHCPKeyConfiguration(this.ORG_ID, params).subscribe((resp: any) => {
            this.closeTab();
            this.cancel();
            this.getListOfData();
          }, (err: HttpErrorResponse) => {
            if (err.error && err.error.error_code) {
              this.pageErrorHandle(err);
            }
          });
        } else {
          this.closeTab();
          this.cancel();

          this.getListOfData();
        }

      }, (err: HttpErrorResponse) => {
        if (err.status == 409 && err.error && err.error.error_code && err.error.error_code.indexOf('already exists') > -1) {
          this.updatePatchMappingSource(data);
        } else if (err.error && err.error.error_code) {
          this.pageErrorHandle(err);
        }
      });
    } else {
      this.updatePatchMappingSource(data);

    }
  }

  updatePatchMappingSource(data) {

    const patches: Observable<any>[] = [];
    patches.push(this.service.patchUpdate({ mappingPrecedence: data.mappingPrecedence }, this.ORG_ID));
    patches.push(this.service.patchUpdate({ nameFormat: data.nameFormat }, this.ORG_ID));

    if (data.subscriberMatchRule != '') {
      patches.push(this.service.patchUpdate({ subscriberMatchRule: data.subscriberMatchRule }, this.ORG_ID));
    }

    if (data.aggregationRules) {
      patches.push(this.service.patchUpdate({ aggregationRules: data.aggregationRules }, this.ORG_ID));
    }

    if (data.mappingPrecedence.indexOf('DHCP') !== -1) {
      let config = (this.keyConfigEditObj && Object.keys(this.keyConfigEditObj).length) ? this.keyConfigEditObj : this.keyConfigDefaultObj;
      let params = {
        macAddress: config.macAddress ? config.macAddress : false,
        remoteId: config.remoteId ? config.remoteId : false,
        circuitId: config.circuitId ? config.circuitId : false,
        subscriberId: config.subscriberId ? config.subscriberId : false,
        clientHostName: config.clientHostName ? config.clientHostName : false
      }
      if (this.keyConfigs && Object.keys(this.keyConfigs).length) {
        params['_id'] = this.keyConfigs._id;
        patches.push(this.service.updateDHCPKeyConfiguration(this.ORG_ID, params));
      } else {
        patches.push(this.service.addDHCPKeyConfiguration(this.ORG_ID, params));
      }

    } else if (data.mappingPrecedence.indexOf('DHCP') === -1 && this.keyConfigs && Object.keys(this.keyConfigs).length) {
      patches.push(this.service.deleteDHCPKeyConfiguration(this.ORG_ID));
    }


    forkJoin(patches).subscribe(
      resultArray => {
        this.closeTab();
        this.cancel();
        this.getListOfData();
      },
      (err: HttpErrorResponse) => {
        this.loading = false;
        this.pageErrorHandle(err);
      }
    );

  }

  getTitle(key: any): any {
    return this.title[key] ? this.title[key] : key;
  }

  public trackItem(index: number, item: any) {
    return item.name;
  }



  closeModal(): void {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }

  pageErrorHandle(err: HttpErrorResponse) {
    let errorInfo = '';
    if (err.status == 400) {
      this.infoBody = this.commonOrgService.pageInvalidRqstErrorHandle(err);
      this.infoTitle = this.language['Error'];
      this.openInfoModal();
      this.loading = false;
    } else {
      if (err.status == 401) {
        errorInfo = this.language['Access Denied'];
      } else {
        errorInfo = this.commonOrgService.pageErrorHandle(err);
      }
      this.commonOrgService.openErrorAlert(errorInfo);
      this.commonOrgService.pageScrollTop();
      this.loading = false;
    }

  }

  openInfoModal() {
    this.closeModal();
    this.modalRef = this.dialogService.open(this.infoModal);
  }

  aggregationRuleNames(name) {
    let rules = [];
    this.aggregationMatchRules[name].forEach(e => {
      if (this.title[e]) {
        rules.push(this.title[e]);
      } else {
        rules.push(e);
      }
    });;
    let delimiter = this.aggregationMatchRules[`${name}_DELIMITER`] ? this.aggregationMatchRules[`${name}_DELIMITER`] : '_';
    let names = '';
    names = rules.join(delimiter);
    return names;
  }

  makeOrderByMapPrecedence(list, orderBy) {
    const sorted = list.sort((a, b) => {
      if (orderBy.indexOf(a.name) < orderBy.indexOf(b.name)) {
        return -1;
      }
      if (orderBy.indexOf(a.name) > orderBy.indexOf(b.name)) {
        return 1;
      }
      return 0;
    })
    return sorted;
  }


  resetKeyConfigurations() {
    this.keyConfigDefaultObj = {
      macAddress: false,
      remoteId: false,
      circuitId: false,
      subscriberId: false,
      clientHostName: false
    }
    this.keyConfigEditObj = {};
    this.keyConfigs = {};
  }

  getKeyConfigurations() {
    this.keyConfigSubs = this.service.getDHCPKeyConfiguration(this.ORG_ID).subscribe((res: any) => {
      this.keyConfigs = res ? res : {};
      if (res && Object.keys(res).length) {
        this.keyConfigDefaultObj = {
          macAddress: res.macAddress ? res.macAddress : false,
          remoteId: res.remoteId ? res.remoteId : false,
          circuitId: res.circuitId ? res.circuitId : false,
          subscriberId: res.subscriberId ? res.subscriberId : false,
          clientHostName: res.clientHostName ? res.clientHostName : false
        }
      } else {
        this.keyConfigDefaultObj = {
          macAddress: false,
          remoteId: false,
          circuitId: false,
          subscriberId: false,
          clientHostName: false
        }
      }

    },
      (err: HttpErrorResponse) => {

      })
  }

  checkKeyConfigStatus(returnData?) {
    if (returnData) {
      let uniqueKey = [];
      if (this.keyConfigDefaultObj.macAddress) {
        uniqueKey.push('MAC Address');
      }

      if (this.keyConfigDefaultObj.remoteId) {
        uniqueKey.push('DHCP Remote Id');
      }

      if (this.keyConfigDefaultObj.circuitId) {
        uniqueKey.push('DHCP Circuit Id');
      }

      if (this.keyConfigDefaultObj.subscriberId) {
        uniqueKey.push('DHCP Subscriber Id');
      }

      if (this.keyConfigDefaultObj.clientHostName) {
        uniqueKey.push('DHCP Client Hostname');
      }
      return uniqueKey.join(', ');

    } else if (this.keyConfigDefaultObj.macAddress || this.keyConfigDefaultObj.remoteId || this.keyConfigDefaultObj.circuitId || this.keyConfigDefaultObj.subscriberId || this.keyConfigDefaultObj.clientHostName) {
      return true;
    }
    return false;
  }

  resetMappingRuleObj() {
    let keys = Object.keys(this.mpngRuleObj);
    if (keys) {
      keys.forEach(key => {
        this.mpngRuleObj[key] = {
          data: [],
          key: key,
          name: key,
          rules: [
            { attrs: [], delimiter: '' }
          ]
        };
      });
    }
  }

  setDefaultRule(mpKey, attrName) {

    return {
      name: mpKey,
      rules: [
        {
          attrs: [attrName],
          delimiter: ""
        }
      ]
    };

  }
}



