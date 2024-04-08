import { trigger,state,style,transition,animate } from "@angular/animations";
 
export const widgetVisibility = trigger('widgetVisibility',[
    state('visible',style({opacity: 1})),
    state('hidden',style({opacity: 0})),
    transition('visible => hidden',animate('500ms ease-out')),
    transition('hidden => visible',animate('500ms ease-in')),

]

)