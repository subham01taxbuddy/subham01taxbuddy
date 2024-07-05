
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, EventEmitter, Injectable, Input, OnInit, Output } from '@angular/core';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener
} from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';
import { UserMsService } from 'src/app/services/user-ms.service';
import { UtilsService } from 'src/app/services/utils.service';
import { ActivatedRoute } from '@angular/router';

export class FoodNode {
  children?: FoodNode[];
  item!: string;
  value!: string;
}

export class CloudFlatNode {
  item!: string;
  value!: string;
  level!: number;
  expandable!: boolean;
}

const TREE_DATA: FoodNode[] = [
  {
    item: 'Common',
    value: 'Common',
  },
  {
    item: 'ITRU',
    value: 'ITRU',
    children: [
      {
        "item": "2022-23",
        "value": "2022-23"
      },
      {
        "item": "2021-22",
        "value": "2021-22"
      }
    ]
  },
  {
    item: 'ITR',
    value: 'ITR',
    children: [
      {
        item: '2019-2020',
        value: '2019-20',
        children: [
          {
            item: 'Original',
            value: 'Original',
            children: [
              {
                item: 'ITR Filing Docs',
                value: 'ITR Filing Docs'
              }
            ]
          },
          {
            item: 'Revised',
            value: 'Revised',
            children: [
              {
                item: 'ITR Filing Docs',
                value: 'ITR Filing Docs'
              }
            ]
          }
        ]
      },
      {
        item: '2020-2021',
        value: '2020-21',
        children: [
          {
            item: 'Original',
            value: 'Original',
            children: [
              {
                item: 'ITR Filing Docs',
                value: 'ITR Filing Docs'
              }
            ]
          },
          {
            item: 'Revised',
            value: 'Revised',
            children: [
              {
                item: 'ITR Filing Docs',
                value: 'ITR Filing Docs'
              }
            ]
          }
        ]
      },
      {
        item: '2021-2022',
        value: '2021-22',
        children: [
          {
            item: 'Original',
            value: 'Original',
            children: [
              {
                item: 'ITR Filing Docs',
                value: 'ITR Filing Docs'
              }
            ]
          },
          {
            item: 'Revised',
            value: 'Revised',
            children: [
              {
                item: 'ITR Filing Docs',
                value: 'ITR Filing Docs'
              }
            ]
          }
        ]
      },
      {
        item: '2022-2023',
        value: '2022-23',
        children: [
          {
            item: 'Original',
            value: 'Original',
            children: [
              {
                item: 'ITR Filing Docs',
                value: 'ITR Filing Docs'
              }
            ]
          },
          {
            item: 'Revised',
            value: 'Revised',
            children: [
              {
                item: 'ITR Filing Docs',
                value: 'ITR Filing Docs'
              }
            ]
          }
        ]
      },
      {
        item: '2023-2024',
        value: '2023-24',
        children: [
          {
            item: 'Original',
            value: 'Original',
            children: [
              {
                item: 'ITR Filing Docs',
                value: 'ITR Filing Docs'
              }
            ]
          },
          {
            item: 'Revised',
            value: 'Revised',
            children: [
              {
                item: 'ITR Filing Docs',
                value: 'ITR Filing Docs'
              }
            ]
          }
        ]
      },
    ]
  },
  {
    item: 'NOTICE',
    value: 'Notice',
    children: [
      {
        item: '2019-2020',
        value: '2019-20',
      },
      {
        item: '2020-2021',
        value: '2020-21',
      },
      {
        item: '2021-2022',
        value: '2021-22',
      },
      {
        item: '2022-2023',
        value: '2022-23',
      },
      {
        item: '2023-2024',
        value: '2023-24',
      },
    ]
  },
  {
    item: 'GST',
    value: 'GST',
    children: [
      {
        item: '2019-2020',
        value: '2019-20',
        children: [
          {
            item: 'January',
            value: 'Jan',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'February',
            value: 'Feb',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'March',
            value: 'Mar',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'April',
            value: 'Apr',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'May',
            value: 'May',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'June',
            value: 'Jun',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'July',
            value: 'July',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'August',
            value: 'Aug',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'September',
            value: 'Sep',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'October',
            value: 'Oct',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'November',
            value: 'Nov',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'December',
            value: 'Dec',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
        ]
      },
      {
        item: '2020-2021',
        value: '2020-21',
        children: [
          {
            item: 'January',
            value: 'Jan',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'February',
            value: 'Feb',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'March',
            value: 'Mar',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'April',
            value: 'Apr',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'May',
            value: 'May',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'June',
            value: 'Jun',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'July',
            value: 'July',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'August',
            value: 'Aug',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'September',
            value: 'Sep',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'October',
            value: 'Oct',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'November',
            value: 'Nov',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'December',
            value: 'Dec',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
        ]
      },
      {
        item: '2021-2022',
        value: '2021-22',
        children: [
          {
            item: 'January',
            value: 'Jan',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'February',
            value: 'Feb',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'March',
            value: 'Mar',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'April',
            value: 'Apr',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'May',
            value: 'May',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'June',
            value: 'Jun',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'July',
            value: 'July',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'August',
            value: 'Aug',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'September',
            value: 'Sep',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'October',
            value: 'Oct',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'November',
            value: 'Nov',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'December',
            value: 'Dec',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
        ]
      },
      {
        item: '2022-2023',
        value: '2022-23',
        children: [
          {
            item: 'January',
            value: 'Jan',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'February',
            value: 'Feb',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'March',
            value: 'Mar',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'April',
            value: 'Apr',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'May',
            value: 'May',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'June',
            value: 'Jun',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'July',
            value: 'July',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'August',
            value: 'Aug',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'September',
            value: 'Sep',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'October',
            value: 'Oct',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'November',
            value: 'Nov',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'December',
            value: 'Dec',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
        ]
      },
      {
        item: '2023-2024',
        value: '2023-24',
        children: [
          {
            item: 'January',
            value: 'Jan',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'February',
            value: 'Feb',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'March',
            value: 'Mar',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'April',
            value: 'Apr',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'May',
            value: 'May',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'June',
            value: 'Jun',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'July',
            value: 'July',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'August',
            value: 'Aug',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'September',
            value: 'Sep',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'October',
            value: 'Oct',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'November',
            value: 'Nov',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
          {
            item: 'December',
            value: 'Dec',
            children: [
              {
                item: 'Invoice',
                value: 'Invoice',
                children: [
                  {
                    item: 'Sales',
                    value: 'Sales',
                  },
                  {
                    item: 'Purchase',
                    value: 'Purchase',
                  },
                  {
                    item: 'Debit Note',
                    value: 'Debit Note',
                  },
                  {
                    item: 'Credit Note',
                    value: 'Credit Note',
                  },
                ]
              },
              {
                item: 'Report',
                value: 'Report',
                children: [
                  {
                    item: 'CSV Files',
                    value: 'CSV Files',
                  }
                ]
              },
              {
                item: 'Document',
                value: 'Document',
              }
            ]
          },
        ]
      },
    ]
  },
  {
    item: 'TPA',
    value: 'TPA',
    children: [
      {
        item: '2019-2020',
        value: '2019-20',
      },
      {
        item: '2020-2021',
        value: '2020-21',
      },
      {
        item: '2021-2022',
        value: '2021-22',
      },
      {
        item: '2022-2023',
        value: '2022-23',
      },
      {
        item: '2023-2024',
        value: '2023-24',
      },
    ]
  },
];

@Injectable({ providedIn: 'root' })
export class ChecklistDatabase {
  dataChange = new BehaviorSubject<FoodNode[]>([]);
  treeData!: any[];

  get data(): FoodNode[] {
    return this.dataChange.value;
  }

  constructor() {
    this.initialize();
  }

  initialize() {
    this.treeData = TREE_DATA;
    const data = TREE_DATA;
    this.dataChange.next(data);
  }

}

@Component({
  selector: 'app-document-upload',
  templateUrl: 'document-upload.component.html',
  styleUrls: ['document-upload.component.css'],
  providers: [ChecklistDatabase]
})
export class DocumentUploadComponent implements OnInit {
  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<CloudFlatNode, FoodNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<FoodNode, CloudFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: CloudFlatNode | null = null;

  /** The new item's name */
  newItemName = '';

  treeControl: FlatTreeControl<CloudFlatNode>;

  treeFlattener: MatTreeFlattener<FoodNode, CloudFlatNode>;

  dataSource: MatTreeFlatDataSource<FoodNode, CloudFlatNode>;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<CloudFlatNode>(true /* multiple */);
  serviceType: any;

  /// Filtering
  // myControl = new UntypedFormControl();
  // options: string[] = ['One', 'Two', 'Three'];
  // filteredOptions: Observable<string[]>;

  constructor(private _database: ChecklistDatabase,
    private userMsService: UserMsService,
    private utilsService: UtilsService,
    private activatedRoute: ActivatedRoute,
  ) {
    if (this.activatedRoute.snapshot.queryParams['serviceType']) {
      this.serviceType = this.activatedRoute.snapshot.queryParams['serviceType'];
    }
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren
    );
    this.treeControl = new FlatTreeControl<CloudFlatNode>(
      this.getLevel,
      this.isExpandable
    );
    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.treeFlattener
    );

    _database.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });
  }

  uploadDoc: any;
  docType: any = [
    { value: 'FORM_16', label: 'Form 16', tree: 'ITR', newTree: 'ITRU' },
    { value: 'AADHAAR_FRONT', label: 'Aadhar front', tree: 'Common' },
    { value: 'AADHAAR_BACK', label: 'Aadhar back', tree: 'Common' },
    { value: 'PAN', label: 'Pan card', tree: 'Common' },
    { value: 'BANK_STATEMENT', label: 'Bank Statement', tree: 'ITR', newTree: 'ITRU' },
    { value: 'CAPITAL_GAIN_STATEMENT', label: 'Capital Gain Statement', tree: 'ITR', newTree: 'ITRU' },
    { value: 'SALE_AGREEMENT', label: 'Sale agreement', tree: 'ITR', newTree: 'ITRU' },
    { value: 'PURCHASE_AGREEMENT', label: 'Purchase agreement', tree: 'ITR', newTree: 'ITRU' },
    { value: 'FOREIGN_INCOME_STATEMENT', label: 'Foreign income statement', tree: 'ITR', newTree: 'ITRU' },
    { value: 'LOAN_STATEMENT', label: 'Loan statement', tree: 'ITR', newTree: 'ITRU' },
    { value: 'FORM_26_AS', label: 'Form 26', tree: 'ITR', newTree: 'ITRU' },
  ];
  isPassProtected!: boolean;
  filePassword: any;
  loading: boolean = false;
  selectedFileType = null;

  @Output() uploadDocument = new EventEmitter<any>();
  @Output() openDocument = new EventEmitter<any>();
  @Input() userId!: any;

  ngOnInit() {
    console.log('userId', this.userId);
  }

  getLevel = (node: CloudFlatNode) => node.level;

  isExpandable = (node: CloudFlatNode) => node.expandable;

  getChildren = (node: FoodNode) => node.children;

  hasChild = (_: number, _nodeData: CloudFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: CloudFlatNode) => _nodeData.item === '';

  transformer = (node: FoodNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode =
      existingNode && existingNode.item === node.item
        ? existingNode
        : new CloudFlatNode();
    flatNode.item = node.item;
    flatNode.value = node.value;
    flatNode.level = level;
    flatNode.expandable = !!node.children;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };

  descendantsAllSelected(node: CloudFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    return descAllSelected;
  }

  descendantsPartiallySelected(node: CloudFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child =>
      this.checklistSelection.isSelected(child)
    );
    return result && !this.descendantsAllSelected(node);
  }

  todoItemSelectionToggle(node: CloudFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    if (!this.checklistSelection.isSelected(node)) {
      this.checklistSelection.deselect(...descendants);
    }
    this.treeControl.toggle(node);
    this.checkSameLevelSelection(this.checklistSelection.selected);
  }

  todoLeafItemSelectionToggle(node: CloudFlatNode): void {
    this.checklistSelection.toggle(node);
    console.log(this.checklistSelection.selected);
    this.checkSameLevelSelection(this.checklistSelection.selected);
  }

  checkSameLevelSelection(selectedArray: any) {
    let getSelectedLevelArray = selectedArray.filter(
      (item: any) => item.level === selectedArray[selectedArray.length - 1].level
    );
    getSelectedLevelArray = getSelectedLevelArray.filter(
      (item: any) => item.item !== selectedArray[selectedArray.length - 1].item
    );

    for (let i = 0; i < getSelectedLevelArray.length; i++) {
      this.checklistSelection.toggle(getSelectedLevelArray[i]);
      const descendants = this.treeControl.getDescendants(
        getSelectedLevelArray[i]
      );
      if (!this.checklistSelection.isSelected(getSelectedLevelArray[i])) {
        this.checklistSelection.deselect(...descendants);
        this.treeControl.collapseDescendants(getSelectedLevelArray[i]);
        this.treeControl.collapse(getSelectedLevelArray[i]);
      }
    }
  }

  checkAllParentsSelection(node: CloudFlatNode): void {
    let parent: CloudFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  checkRootNodeSelection(node: CloudFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  getParentNode(node: CloudFlatNode): CloudFlatNode | null {
    console.log(this.checklistSelection.selected);
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  getSelectedItems(): string {
    if (!this.checklistSelection.selected.length) return 'Select Cloud Path';
    return this.checklistSelection.selected.map(s => s.value).join('/');
  }

  clearDocVal() {
    console.log('selected=>', this.getSelectedItems(), this.selectedFileType);
    let event = {
      path: this.getSelectedItems(),
      type: this.selectedFileType
    };
    this.openDocument.emit(event);

    this.uploadDoc = null;
    this.filePassword = '';
    this.isPassProtected = false;
  }

  uploadFile(event: Event) {
    let file = (event.target as HTMLInputElement).files;
    console.log("File", file);
    this.filePassword = '';
    if (file.length > 0) {
      this.uploadDoc = file.item(0);
    }
  }

  upload() {
    document.getElementById("input-file-id")?.click();
  }

  checkDocPassProtected(type: any, document: any, password: any) {
    console.log('type: ', type, ' document: ', document)
    // return;
    if (document.name.split('.').reverse()[0] === 'pdf') {
      this.loading = true;
      const formData = new FormData();
      formData.append("password", password);
      formData.append("multipartFile", document);
      let param = '/gateway/custom-bot/is-password-protected'
      this.userMsService.postMethodInfo(param, formData).subscribe((res: any) => {
        this.loading = false;
        if (res.response === 'File is password protected!') {
          this.isPassProtected = true;
        }
        else if (res.response === 'Invalid Password') {
          this.isPassProtected = true;
          this.utilsService.showSnackBar('Invalid Password, Enter valid password.')
        }
        else if (res.response === 'Valid Password') {
          this.isPassProtected = false;
          this.uploadDocuments(type, document, password)
        }
        else if (res.response === 'File is not password protected!') {
          this.isPassProtected = false;
          this.uploadDocuments(type, document)
        }
      },
        error => {
          this.loading = false;
        })
    }
    else {
      this.uploadDocuments(type, document)

    }
  }

  uploadDocuments(type: any, document: any, password?: any) {
    this.loading = true;
    let s3ObjectUrl = `${this.userId}/${this.getSelectedItems()}/${document.name}`;
    let pass;
    if (password) {
      pass = '","password":"' + password + '"';
    }
    else {
      pass = '"';
    }
    let documentTag = '';
    if (this.selectedFileType) {
      documentTag = '","documentTag":"' + this.selectedFileType;
    }


    let cloudFileMetaData = '{"fileName":"' + document.name + documentTag + '","userId":' + this.userId + ',"accessRight":["' + this.userId + '_W"' + '],"origin":"BO", "s3ObjectUrl":"' + s3ObjectUrl + pass + '}';
    console.log("cloudFileMetaData ===> ", cloudFileMetaData)
    const formData = new FormData();
    formData.append("file", document);
    formData.append("cloudFileMetaData", cloudFileMetaData);
    formData.append("serviceType", this.serviceType);
    console.log("formData ===> ", formData);
    let param = '/itr/cloud/upload'
    this.userMsService.postMethodInfo(param, formData).subscribe((res: any) => {
      this.loading = false;
      if (res.Failed === 'Failed to uploade file!') {
        this.utilsService.showSnackBar(res.Failed)
      } else if (res.Success === 'File successfully uploaded!') {
        this.utilsService.showSnackBar(res.Success);
        this.uploadDocument.emit('File uploaded successfully');
        this.uploadDoc = null;
      } else {
        this.utilsService.showSnackBar(res.Failed)
      }
    },
      error => {
        this.loading = false;
      })
  }

  isSelectFileTypeAvailable() {
    let tree = this.getSelectedItems();
    if (tree.startsWith('ITR') || tree.startsWith('Common')) {
      return false;
    }
    this.selectedFileType = null;
    return true
  }
}
