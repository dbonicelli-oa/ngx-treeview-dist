import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DropdownDirective } from './directives/dropdown.directive';
import { DropdownMenuDirective } from './directives/dropdown-menu.directive';
import { DropdownToggleDirective } from './directives/dropdown-toggle.directive';
import { DropdownTreeviewComponent } from './components/dropdown-treeview/dropdown-treeview.component';
import { TreeviewComponent } from './components/treeview/treeview.component';
import { TreeviewItemComponent } from './components/treeview-item/treeview-item.component';
import { TreeviewPipe } from './pipes/treeview.pipe';
import { TreeviewI18n, DefaultTreeviewI18n } from './models/treeview-i18n';
import { TreeviewConfig } from './models/treeview-config';
import { TreeviewEventParser, DefaultTreeviewEventParser } from './helpers/treeview-event-parser';
export class TreeviewModule {
    static forRoot() {
        return {
            ngModule: TreeviewModule,
            providers: [
                TreeviewConfig,
                { provide: TreeviewI18n, useClass: DefaultTreeviewI18n },
                { provide: TreeviewEventParser, useClass: DefaultTreeviewEventParser }
            ]
        };
    }
}
TreeviewModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    FormsModule,
                    CommonModule
                ],
                declarations: [
                    TreeviewComponent,
                    TreeviewItemComponent,
                    TreeviewPipe,
                    DropdownDirective,
                    DropdownMenuDirective,
                    DropdownToggleDirective,
                    DropdownTreeviewComponent
                ], exports: [
                    TreeviewComponent,
                    TreeviewPipe,
                    DropdownTreeviewComponent
                ]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZXZpZXcubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LXRyZWV2aWV3L3NyYy9saWIvdHJlZXZpZXcubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQXVCLE1BQU0sZUFBZSxDQUFDO0FBQzlELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUM3QyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDcEUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDN0UsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDakYsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sNERBQTRELENBQUM7QUFDdkcsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sMENBQTBDLENBQUM7QUFDN0UsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sb0RBQW9ELENBQUM7QUFDM0YsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ3JELE9BQU8sRUFBRSxZQUFZLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUMzRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDMUQsT0FBTyxFQUFFLG1CQUFtQixFQUFFLDBCQUEwQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFxQmxHLE1BQU0sT0FBTyxjQUFjO0lBQ3pCLE1BQU0sQ0FBQyxPQUFPO1FBQ1osT0FBTztZQUNMLFFBQVEsRUFBRSxjQUFjO1lBQ3hCLFNBQVMsRUFBRTtnQkFDVCxjQUFjO2dCQUNkLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsbUJBQW1CLEVBQUU7Z0JBQ3hELEVBQUUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLFFBQVEsRUFBRSwwQkFBMEIsRUFBRTthQUN2RTtTQUNGLENBQUM7SUFDSixDQUFDOzs7WUE3QkYsUUFBUSxTQUFDO2dCQUNSLE9BQU8sRUFBRTtvQkFDUCxXQUFXO29CQUNYLFlBQVk7aUJBQ2I7Z0JBQ0QsWUFBWSxFQUFFO29CQUNaLGlCQUFpQjtvQkFDakIscUJBQXFCO29CQUNyQixZQUFZO29CQUNaLGlCQUFpQjtvQkFDakIscUJBQXFCO29CQUNyQix1QkFBdUI7b0JBQ3ZCLHlCQUF5QjtpQkFDMUIsRUFBRSxPQUFPLEVBQUU7b0JBQ1YsaUJBQWlCO29CQUNqQixZQUFZO29CQUNaLHlCQUF5QjtpQkFDMUI7YUFDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlLCBNb2R1bGVXaXRoUHJvdmlkZXJzIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBGb3Jtc01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBEcm9wZG93bkRpcmVjdGl2ZSB9IGZyb20gJy4vZGlyZWN0aXZlcy9kcm9wZG93bi5kaXJlY3RpdmUnO1xuaW1wb3J0IHsgRHJvcGRvd25NZW51RGlyZWN0aXZlIH0gZnJvbSAnLi9kaXJlY3RpdmVzL2Ryb3Bkb3duLW1lbnUuZGlyZWN0aXZlJztcbmltcG9ydCB7IERyb3Bkb3duVG9nZ2xlRGlyZWN0aXZlIH0gZnJvbSAnLi9kaXJlY3RpdmVzL2Ryb3Bkb3duLXRvZ2dsZS5kaXJlY3RpdmUnO1xuaW1wb3J0IHsgRHJvcGRvd25UcmVldmlld0NvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50cy9kcm9wZG93bi10cmVldmlldy9kcm9wZG93bi10cmVldmlldy5jb21wb25lbnQnO1xuaW1wb3J0IHsgVHJlZXZpZXdDb21wb25lbnQgfSBmcm9tICcuL2NvbXBvbmVudHMvdHJlZXZpZXcvdHJlZXZpZXcuY29tcG9uZW50JztcbmltcG9ydCB7IFRyZWV2aWV3SXRlbUNvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50cy90cmVldmlldy1pdGVtL3RyZWV2aWV3LWl0ZW0uY29tcG9uZW50JztcbmltcG9ydCB7IFRyZWV2aWV3UGlwZSB9IGZyb20gJy4vcGlwZXMvdHJlZXZpZXcucGlwZSc7XG5pbXBvcnQgeyBUcmVldmlld0kxOG4sIERlZmF1bHRUcmVldmlld0kxOG4gfSBmcm9tICcuL21vZGVscy90cmVldmlldy1pMThuJztcbmltcG9ydCB7IFRyZWV2aWV3Q29uZmlnIH0gZnJvbSAnLi9tb2RlbHMvdHJlZXZpZXctY29uZmlnJztcbmltcG9ydCB7IFRyZWV2aWV3RXZlbnRQYXJzZXIsIERlZmF1bHRUcmVldmlld0V2ZW50UGFyc2VyIH0gZnJvbSAnLi9oZWxwZXJzL3RyZWV2aWV3LWV2ZW50LXBhcnNlcic7XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtcbiAgICBGb3Jtc01vZHVsZSxcbiAgICBDb21tb25Nb2R1bGVcbiAgXSxcbiAgZGVjbGFyYXRpb25zOiBbXG4gICAgVHJlZXZpZXdDb21wb25lbnQsXG4gICAgVHJlZXZpZXdJdGVtQ29tcG9uZW50LFxuICAgIFRyZWV2aWV3UGlwZSxcbiAgICBEcm9wZG93bkRpcmVjdGl2ZSxcbiAgICBEcm9wZG93bk1lbnVEaXJlY3RpdmUsXG4gICAgRHJvcGRvd25Ub2dnbGVEaXJlY3RpdmUsXG4gICAgRHJvcGRvd25UcmVldmlld0NvbXBvbmVudFxuICBdLCBleHBvcnRzOiBbXG4gICAgVHJlZXZpZXdDb21wb25lbnQsXG4gICAgVHJlZXZpZXdQaXBlLFxuICAgIERyb3Bkb3duVHJlZXZpZXdDb21wb25lbnRcbiAgXVxufSlcbmV4cG9ydCBjbGFzcyBUcmVldmlld01vZHVsZSB7XG4gIHN0YXRpYyBmb3JSb290KCk6IE1vZHVsZVdpdGhQcm92aWRlcnM8VHJlZXZpZXdNb2R1bGU+IHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IFRyZWV2aWV3TW9kdWxlLFxuICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIFRyZWV2aWV3Q29uZmlnLFxuICAgICAgICB7IHByb3ZpZGU6IFRyZWV2aWV3STE4biwgdXNlQ2xhc3M6IERlZmF1bHRUcmVldmlld0kxOG4gfSxcbiAgICAgICAgeyBwcm92aWRlOiBUcmVldmlld0V2ZW50UGFyc2VyLCB1c2VDbGFzczogRGVmYXVsdFRyZWV2aWV3RXZlbnRQYXJzZXIgfVxuICAgICAgXVxuICAgIH07XG4gIH1cbn1cbiJdfQ==