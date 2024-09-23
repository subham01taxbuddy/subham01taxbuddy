import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { GridOptions } from 'ag-grid-community';
import { AppConstants } from 'src/app/modules/shared/constants';
import {
  ITR_JSON,
  NewCapitalGain,
} from 'src/app/modules/shared/interfaces/itr-input.interface';
import { ItrMsService } from 'src/app/services/itr-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { LabFormComponent } from './lab-form/lab-form.component';
import { WizardNavigation } from '../../../../../itr-shared/WizardNavigation';

@Component({
  selector: 'app-land-and-building',
  templateUrl: './land-and-building.component.html',
  styleUrls: ['./land-and-building.component.scss'],
})
export class LandAndBuildingComponent
  extends WizardNavigation
  implements OnInit, OnChanges {
  @ViewChild(LabFormComponent) labFormComponent;

  loading = false;
  ITR_JSON: ITR_JSON;
  labData: NewCapitalGain[] = [];
  Copy_ITR_JSON: ITR_JSON;
  isExmptAvail = false;
  assestTypesDropdown = [];
  labView: string = 'FORM';

  public investmentGridOptions: GridOptions;
  showInvestmentTable = false;

  propertiesForm: UntypedFormGroup;
  properties = [];
  data: any;
  PREV_ITR_JSON: any;
  constructor(
    private itrMsService: ItrMsService,
    public utilsService: UtilsService,
    public matDialog: MatDialog,
    private fb: UntypedFormBuilder,
    private location: Location
  ) {
    super();
    this.PREV_ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.PREV_ITR_JSON));
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    this.labData = this.ITR_JSON.capitalGain?.filter(
      (item) => item.assetType === 'PLOT_OF_LAND'
    );
    this.getAssetDetails();
    this.cgCreateRowData();

    let array = [];
    this.properties.forEach((prop) => {
      array.push(
        fb.group({
          index: prop.id - 1,
          selected: false,
        })
      );
    });
    this.propertiesForm = fb.group({
      propertiesArray: fb.array(array),
    });

    // TODO Add this in edit or add section
    this.data = {
      assestDetails: [],
      ITR_JSON: this.ITR_JSON,
      mode: 'ADD',
    };
  }

  isPropertySelected() {
    let array = this.propertiesForm.controls['propertiesArray'] as UntypedFormArray;
    let selected = array.controls.filter(
      (control: UntypedFormGroup) => control.controls['selected'].value === true
    );
    return selected.length > 0;
  }

  get getPropertiesArrayForForm() {
    return <UntypedFormArray>this.propertiesForm.get('propertiesArray');
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('+++++++++', changes);
  }

  ngOnInit() {
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    let labData = this.ITR_JSON.capitalGain?.filter(
      (item) => item.assetType === 'PLOT_OF_LAND'
    );
    if (labData?.length > 0) {
      this.labView = 'TABLE';
    }
  }

  addCapitalGain(mode, assetSelected) {
    console.log('Edit CG:', assetSelected);
    let assetDetails = null;
    if (mode === 'EDIT') {
      let selectedTypeList = this.Copy_ITR_JSON.capitalGain.filter(
        (item) => item.assetType === assetSelected.assetType
      )[0];
      if (selectedTypeList) {
        assetDetails = selectedTypeList.assetDetails.filter(
          (itm) => itm.srn === assetSelected.srn
        )[0];
      }
    }
    this.labView = 'FORM';
    this.data = {
      assetDetails: [],
      ITR_JSON: this.ITR_JSON,
      mode: mode,
      assetSelected: assetDetails,
    };
  }

  cgCreateRowData() {
    this.isExmptAvail = false;
    this.properties = [];
    let labData = this.ITR_JSON.capitalGain?.filter(
      (item) => item.assetType === 'PLOT_OF_LAND'
    );
    for (let i = 0; labData && i < labData[0]?.assetDetails?.length; i++) {
      let assetDetails = labData[0].assetDetails[i];
      let buyerDetails = labData[0].buyersDetails?.filter(
        (buyer) => buyer.srn === assetDetails.srn
      )[0];
      let costOfImprovement = 0;
      let improvements = labData[0].improvement?.filter(
        (imp) => imp.srn == assetDetails.srn
      );
      for (let j = 0; j < improvements?.length; j++) {
        costOfImprovement =
          costOfImprovement + improvements[j].costOfImprovement;
      }
      console.log('cost', improvements.length, costOfImprovement);

      let totalDeductions = 0;
      let deductions = labData[0].deduction?.filter(
        (ded) => ded.srn == assetDetails.srn
      );
      for (let j = 0; j < deductions?.length; j++) {
        totalDeductions = totalDeductions + deductions[j].totalDeductionClaimed;
      }

      this.properties.push({
        id: i + 1,
        srn: assetDetails.srn,
        assetType: labData[0].assetType,
        description: assetDetails.description,
        sellDate: assetDetails.sellDate,
        costOfAcquisition: assetDetails.indexCostOfAcquisition,
        valueInConsideration: /* value */ assetDetails.valueInConsideration,
        // totalCost: tCost,
        gainType: assetDetails.gainType,
        cgIncome: assetDetails.capitalGain,
        deductions: totalDeductions, //TODO
        sellExpense: assetDetails.sellExpense,
        improvements: costOfImprovement,
        address: buyerDetails?.address,
        pin: buyerDetails?.pin,
        // isExemptionApplied: cgIncome.length > 0 ? cgIncome[0].isExemptionApplied : false,
        isShow: true,
        rowSpan: 1,
        assetSelected: JSON.stringify(assetDetails),
      });
      console.log('row', assetDetails, costOfImprovement);
    }
  }

  getAssetDetails() {
    // todo
    const param = '/assetDetails';
    this.itrMsService.getMethod(param).subscribe(
      (result: any) => {
        console.log('Asset Details =', result);
        this.assestTypesDropdown = result;
        this.cgCreateRowData();
        if (this.ITR_JSON.capitalGain?.length > 0) {
          let array = [];
          this.properties.forEach((prop) => {
            array.push(
              this.fb.group({
                index: prop.id - 1,
                selected: false,
              })
            );
          });
          this.propertiesForm = this.fb.group({
            propertiesArray: this.fb.array(array),
          });
        }
      },
      (error) => {
        this.getAssetDetails();
      }
    );
  }

  cancelForm(event) {
    this.data = event.data;
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
    this.getAssetDetails();
    this.labView = event.view;
  }

  deleteCapitalGain() {
    let array = this.propertiesForm.controls['propertiesArray'] as UntypedFormArray;
    let selected = array.controls.filter(
      (control: UntypedFormGroup) => control.controls['selected'].value === true
    );

    //re-intialise the ITR objects
    this.ITR_JSON = JSON.parse(sessionStorage.getItem(AppConstants.ITR_JSON));
    this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));

    this.loading = true;
    selected.forEach((selectedProp) => {
      let assetSelected = this.properties[selectedProp.value.index];
      let selectedObject = JSON.parse(assetSelected.assetSelected);
      let filtered = this.Copy_ITR_JSON.capitalGain.filter(
        (item) => item.assetType !== assetSelected.assetType
      );
      let selectedTypeList = this.Copy_ITR_JSON.capitalGain.filter(
        (item) => item.assetType === assetSelected.assetType
      )[0];
      if (selectedTypeList) {
        selectedTypeList.assetDetails = selectedTypeList.assetDetails.filter(
          (itm) => itm.srn !== selectedObject.srn
        );
        selectedTypeList.deduction = selectedTypeList.deduction?.filter(
          (itm) => itm.srn !== selectedObject.srn
        );
        selectedTypeList.improvement = selectedTypeList.improvement?.filter(
          (itm) => itm.srn !== selectedObject.srn
        );
        selectedTypeList.buyersDetails = selectedTypeList.buyersDetails?.filter(
          (itm) => itm.srn !== selectedObject.srn
        );
      }
      this.Copy_ITR_JSON.capitalGain = filtered;
      if (selectedTypeList && selectedTypeList.assetDetails.length > 0) {
        this.Copy_ITR_JSON.capitalGain.push(selectedTypeList);
      }
    });

    this.utilsService.saveItrObject(this.Copy_ITR_JSON).subscribe(
      (result: any) => {
        this.ITR_JSON = result;
        this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
        sessionStorage.setItem('ITR_JSON', JSON.stringify(this.ITR_JSON));
        this.loading = false;
        this.utilsService.showSnackBar('Capital gain deleted successfully');
        console.log('Capital gain save result=', result);
        this.utilsService.smoothScrollToTop();
        this.cgCreateRowData();

        let array = [];
        this.properties.forEach((prop) => {
          array.push(
            this.fb.group({
              index: prop.id - 1,
              selected: false,
            })
          );
        });
        this.propertiesForm = this.fb.group({
          propertiesArray: this.fb.array(array),
        });
      },
      (error) => {
        this.Copy_ITR_JSON = JSON.parse(JSON.stringify(this.ITR_JSON));
        this.loading = false;
        this.utilsService.showSnackBar('Failed to delete capital gain data');
        this.utilsService.smoothScrollToTop();
      }
    );
  }

  goBack() {
    this.location.back();
    this.saveAndNext.emit(false);
  }

  saveFormData() {
    this.loading = true;
    this.labFormComponent.saveImmovableCG(this.labFormComponent.immovableForm, 0, true);
    this.loading = false;
  }

  formSaved(event) {
    this.loading = false;
  }
}
