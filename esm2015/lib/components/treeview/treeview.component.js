import { Component, Input, Output, EventEmitter } from '@angular/core';
import { isNil, includes } from 'lodash';
import { TreeviewI18n } from '../../models/treeview-i18n';
import { TreeviewItem } from '../../models/treeview-item';
import { TreeviewConfig } from '../../models/treeview-config';
import { TreeviewHelper } from '../../helpers/treeview-helper';
import { TreeviewEventParser } from '../../helpers/treeview-event-parser';
class FilterTreeviewItem extends TreeviewItem {
    constructor(item) {
        super({
            text: item.text,
            value: item.value,
            disabled: item.disabled,
            checked: item.checked,
            collapsed: item.collapsed,
            children: item.children
        });
        this.refItem = item;
    }
    updateRefChecked() {
        this.children.forEach(child => {
            if (child instanceof FilterTreeviewItem) {
                child.updateRefChecked();
            }
        });
        let refChecked = this.checked;
        if (refChecked) {
            for (const refChild of this.refItem.children) {
                if (!refChild.checked) {
                    refChecked = false;
                    break;
                }
            }
        }
        this.refItem.checked = refChecked;
    }
}
export class TreeviewComponent {
    constructor(i18n, defaultConfig, eventParser) {
        this.i18n = i18n;
        this.defaultConfig = defaultConfig;
        this.eventParser = eventParser;
        this.selectedChange = new EventEmitter();
        this.filterChange = new EventEmitter();
        this.filterText = '';
        this.config = this.defaultConfig;
        this.allItem = new TreeviewItem({ text: 'All', value: undefined });
    }
    get hasFilterItems() {
        return !isNil(this.filterItems) && this.filterItems.length > 0;
    }
    get maxHeight() {
        return `${this.config.maxHeight}`;
    }
    ngOnInit() {
        this.createHeaderTemplateContext();
        this.generateSelection();
    }
    ngOnChanges(changes) {
        const itemsSimpleChange = changes.items;
        if (!isNil(itemsSimpleChange) && !isNil(this.items)) {
            this.updateFilterItems();
            this.updateCollapsedOfAll();
            this.raiseSelectedChange();
        }
    }
    onAllCollapseExpand() {
        this.allItem.collapsed = !this.allItem.collapsed;
        this.filterItems.forEach(item => item.setCollapsedRecursive(this.allItem.collapsed));
    }
    onFilterTextChange(text) {
        this.filterText = text;
        this.filterChange.emit(text);
        this.updateFilterItems();
    }
    onAllCheckedChange() {
        const checked = this.allItem.checked;
        this.filterItems.forEach(item => {
            item.setCheckedRecursive(checked);
            if (item instanceof FilterTreeviewItem) {
                item.updateRefChecked();
            }
        });
        this.raiseSelectedChange();
    }
    onItemCheckedChange(item, checked) {
        if (item instanceof FilterTreeviewItem) {
            item.updateRefChecked();
        }
        this.updateCheckedOfAll();
        this.raiseSelectedChange();
    }
    raiseSelectedChange() {
        this.generateSelection();
        const values = this.eventParser.getSelectedChange(this);
        setTimeout(() => {
            this.selectedChange.emit(values);
        });
    }
    createHeaderTemplateContext() {
        this.headerTemplateContext = {
            config: this.config,
            item: this.allItem,
            onCheckedChange: () => this.onAllCheckedChange(),
            onCollapseExpand: () => this.onAllCollapseExpand(),
            onFilterTextChange: (text) => this.onFilterTextChange(text)
        };
    }
    generateSelection() {
        let checkedItems = [];
        let uncheckedItems = [];
        if (!isNil(this.items)) {
            const selection = TreeviewHelper.concatSelection(this.items, checkedItems, uncheckedItems);
            checkedItems = selection.checked;
            uncheckedItems = selection.unchecked;
        }
        this.selection = {
            checkedItems,
            uncheckedItems
        };
    }
    updateFilterItems() {
        if (this.filterText !== '') {
            const filterItems = [];
            const filterText = this.filterText.toLowerCase();
            this.items.forEach(item => {
                const newItem = this.filterItem(item, filterText);
                if (!isNil(newItem)) {
                    filterItems.push(newItem);
                }
            });
            this.filterItems = filterItems;
        }
        else {
            this.filterItems = this.items;
        }
        this.updateCheckedOfAll();
    }
    filterItem(item, filterText) {
        const isMatch = includes(item.text.toLowerCase(), filterText);
        if (isMatch) {
            return item;
        }
        else {
            if (!isNil(item.children)) {
                const children = [];
                item.children.forEach(child => {
                    const newChild = this.filterItem(child, filterText);
                    if (!isNil(newChild)) {
                        children.push(newChild);
                    }
                });
                if (children.length > 0) {
                    const newItem = new FilterTreeviewItem(item);
                    newItem.collapsed = false;
                    newItem.children = children;
                    return newItem;
                }
            }
        }
        return undefined;
    }
    updateCheckedOfAll() {
        let itemChecked = null;
        for (const filterItem of this.filterItems) {
            if (itemChecked === null) {
                itemChecked = filterItem.checked;
            }
            else if (itemChecked !== filterItem.checked) {
                itemChecked = undefined;
                break;
            }
        }
        if (itemChecked === null) {
            itemChecked = false;
        }
        this.allItem.checked = itemChecked;
    }
    updateCollapsedOfAll() {
        let hasItemExpanded = false;
        for (const filterItem of this.filterItems) {
            if (!filterItem.collapsed) {
                hasItemExpanded = true;
                break;
            }
        }
        this.allItem.collapsed = !hasItemExpanded;
    }
}
TreeviewComponent.decorators = [
    { type: Component, args: [{
                selector: 'ngx-treeview',
                template: "<ng-template #defaultItemTemplate let-item=\"item\" let-onCollapseExpand=\"onCollapseExpand\"\n  let-onCheckedChange=\"onCheckedChange\">\n  <div class=\"form-inline row-item\">\n    <i *ngIf=\"item.children\" (click)=\"onCollapseExpand()\" aria-hidden=\"true\" [ngSwitch]=\"item.collapsed\">\n      <svg *ngSwitchCase=\"true\" width=\"0.8rem\" height=\"0.8rem\" viewBox=\"0 0 16 16\" class=\"bi bi-caret-right-fill\"\n        fill=\"currentColor\" xmlns=\"http://www.w3.org/2000/svg\">\n        <path\n          d=\"M12.14 8.753l-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z\" />\n      </svg>\n      <svg *ngSwitchCase=\"false\" width=\"0.8rem\" height=\"0.8rem\" viewBox=\"0 0 16 16\" class=\"bi bi-caret-down-fill\"\n        fill=\"currentColor\" xmlns=\"http://www.w3.org/2000/svg\">\n        <path\n          d=\"M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z\" />\n      </svg>\n    </i>\n    <div class=\"form-check\">\n      <input type=\"checkbox\" class=\"form-check-input\" [(ngModel)]=\"item.checked\" (ngModelChange)=\"onCheckedChange()\"\n        [disabled]=\"item.disabled\" [indeterminate]=\"item.indeterminate\" />\n      <label class=\"form-check-label\" (click)=\"item.checked = !item.checked; onCheckedChange()\">\n        {{item.text}}\n      </label>\n    </div>\n  </div>\n</ng-template>\n<ng-template #defaultHeaderTemplate let-config=\"config\" let-item=\"item\" let-onCollapseExpand=\"onCollapseExpand\"\n  let-onCheckedChange=\"onCheckedChange\" let-onFilterTextChange=\"onFilterTextChange\">\n  <div *ngIf=\"config.hasFilter\" class=\"row row-filter\">\n    <div class=\"col-12\">\n      <input class=\"form-control\" type=\"text\" [placeholder]=\"i18n.getFilterPlaceholder()\" [(ngModel)]=\"filterText\"\n        (ngModelChange)=\"onFilterTextChange($event)\" />\n    </div>\n  </div>\n  <div *ngIf=\"hasFilterItems\">\n    <div *ngIf=\"config.hasAllCheckBox || config.hasCollapseExpand\" class=\"row row-all\">\n      <div class=\"col-12\">\n        <div class=\"form-check form-check-inline\" *ngIf=\"config.hasAllCheckBox\">\n          <input type=\"checkbox\" class=\"form-check-input\" [(ngModel)]=\"item.checked\" (ngModelChange)=\"onCheckedChange()\"\n            [indeterminate]=\"item.indeterminate\" />\n          <label class=\"form-check-label\" (click)=\"item.checked = !item.checked; onCheckedChange()\">\n            {{i18n.getAllCheckboxText()}}\n          </label>\n        </div>\n        <label *ngIf=\"config.hasCollapseExpand\" class=\"float-right form-check-label\" (click)=\"onCollapseExpand()\">\n          <i [title]=\"i18n.getTooltipCollapseExpandText(item.collapsed)\" aria-hidden=\"true\" [ngSwitch]=\"item.collapsed\">\n            <svg *ngSwitchCase=\"true\" width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-arrows-angle-expand\"\n              fill=\"currentColor\" xmlns=\"http://www.w3.org/2000/svg\">\n              <path fill-rule=\"evenodd\"\n                d=\"M1.5 10.036a.5.5 0 0 1 .5.5v3.5h3.5a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 .5-.5z\" />\n              <path fill-rule=\"evenodd\"\n                d=\"M6.354 9.646a.5.5 0 0 1 0 .708l-4.5 4.5a.5.5 0 0 1-.708-.708l4.5-4.5a.5.5 0 0 1 .708 0zm8.5-8.5a.5.5 0 0 1 0 .708l-4.5 4.5a.5.5 0 0 1-.708-.708l4.5-4.5a.5.5 0 0 1 .708 0z\" />\n              <path fill-rule=\"evenodd\"\n                d=\"M10.036 1.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 1 1-1 0V2h-3.5a.5.5 0 0 1-.5-.5z\" />\n            </svg>\n            <svg *ngSwitchCase=\"false\" width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-arrows-angle-contract\"\n              fill=\"currentColor\" xmlns=\"http://www.w3.org/2000/svg\">\n              <path fill-rule=\"evenodd\"\n                d=\"M9.5 2.036a.5.5 0 0 1 .5.5v3.5h3.5a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 .5-.5z\" />\n              <path fill-rule=\"evenodd\"\n                d=\"M14.354 1.646a.5.5 0 0 1 0 .708l-4.5 4.5a.5.5 0 1 1-.708-.708l4.5-4.5a.5.5 0 0 1 .708 0zm-7.5 7.5a.5.5 0 0 1 0 .708l-4.5 4.5a.5.5 0 0 1-.708-.708l4.5-4.5a.5.5 0 0 1 .708 0z\" />\n              <path fill-rule=\"evenodd\"\n                d=\"M2.036 9.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V10h-3.5a.5.5 0 0 1-.5-.5z\" />\n            </svg>\n          </i>\n        </label>\n      </div>\n    </div>\n    <div *ngIf=\"config.hasDivider\" class=\"dropdown-divider\"></div>\n  </div>\n</ng-template>\n<div class=\"treeview-header\">\n  <ng-template [ngTemplateOutlet]=\"headerTemplate || defaultHeaderTemplate\"\n    [ngTemplateOutletContext]=\"headerTemplateContext\">\n  </ng-template>\n</div>\n<div [ngSwitch]=\"hasFilterItems\">\n  <div *ngSwitchCase=\"true\" class=\"treeview-container\" [style.max-height.px]=\"maxHeight\">\n    <ngx-treeview-item *ngFor=\"let item of filterItems\" [config]=\"config\" [item]=\"item\"\n      [template]=\"itemTemplate || defaultItemTemplate\" (checkedChange)=\"onItemCheckedChange(item, $event)\">\n    </ngx-treeview-item>\n  </div>\n  <div *ngSwitchCase=\"false\" class=\"treeview-text\">\n    {{i18n.getFilterNoItemsFoundText()}}\n  </div>\n</div>\n",
                styles: [":host .treeview-header .row-filter{margin-bottom:.5rem}:host .treeview-header .row-all .bi{cursor:pointer}:host .treeview-container .row-item{margin-bottom:.3rem;flex-wrap:nowrap}:host .treeview-container .row-item .bi{cursor:pointer;margin-right:.3rem}.treeview-container{overflow-y:auto;padding-right:.3rem}.treeview-text{padding:.3rem 0;white-space:nowrap}"]
            },] }
];
TreeviewComponent.ctorParameters = () => [
    { type: TreeviewI18n },
    { type: TreeviewConfig },
    { type: TreeviewEventParser }
];
TreeviewComponent.propDecorators = {
    headerTemplate: [{ type: Input }],
    itemTemplate: [{ type: Input }],
    items: [{ type: Input }],
    config: [{ type: Input }],
    selectedChange: [{ type: Output }],
    filterChange: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZXZpZXcuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LXRyZWV2aWV3L3NyYy9saWIvY29tcG9uZW50cy90cmVldmlldy90cmVldmlldy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBaUQsTUFBTSxlQUFlLENBQUM7QUFDdEgsT0FBTyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFDekMsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzFELE9BQU8sRUFBRSxZQUFZLEVBQXFCLE1BQU0sNEJBQTRCLENBQUM7QUFDN0UsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRzlELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUMvRCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUUxRSxNQUFNLGtCQUFtQixTQUFRLFlBQVk7SUFFM0MsWUFBWSxJQUFrQjtRQUM1QixLQUFLLENBQUM7WUFDSixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7WUFDZixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7WUFDakIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO1lBQ3ZCLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztZQUNyQixTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVM7WUFDekIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO1NBQ3hCLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0lBQ3RCLENBQUM7SUFFRCxnQkFBZ0I7UUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUM1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RUQsSUFBSSxXQUFXLEtBQUssSUFBSSxFQUFFO1lBQ3hCLFdBQVcsR0FBRyxLQUFLLENBQUM7U0FDckI7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUM7SUFDckMsQ0FBQztJQUVPLG9CQUFvQjtRQUMxQixJQUFJLGVBQWUsR0FBRyxLQUFLLENBQUM7UUFDNUIsS0FBSyxNQUFNLFVBQVUsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ3pDLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFO2dCQUN6QixlQUFlLEdBQUcsSUFBSSxDQUFDO2dCQUN2QixNQUFNO2FBQ1A7U0FDRjtRQUVELElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLENBQUMsZUFBZSxDQUFDO0lBQzVDLENBQUM7OztZQXpMRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLGNBQWM7Z0JBQ3hCLDJtS0FBd0M7O2FBRXpDOzs7WUE5Q1EsWUFBWTtZQUVaLGNBQWM7WUFJZCxtQkFBbUI7Ozs2QkEwQ3pCLEtBQUs7MkJBQ0wsS0FBSztvQkFDTCxLQUFLO3FCQUNMLEtBQUs7NkJBQ0wsTUFBTTsyQkFDTixNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbnB1dCwgT3V0cHV0LCBFdmVudEVtaXR0ZXIsIFNpbXBsZUNoYW5nZXMsIE9uQ2hhbmdlcywgVGVtcGxhdGVSZWYsIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgaXNOaWwsIGluY2x1ZGVzIH0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IFRyZWV2aWV3STE4biB9IGZyb20gJy4uLy4uL21vZGVscy90cmVldmlldy1pMThuJztcbmltcG9ydCB7IFRyZWV2aWV3SXRlbSwgVHJlZXZpZXdTZWxlY3Rpb24gfSBmcm9tICcuLi8uLi9tb2RlbHMvdHJlZXZpZXctaXRlbSc7XG5pbXBvcnQgeyBUcmVldmlld0NvbmZpZyB9IGZyb20gJy4uLy4uL21vZGVscy90cmVldmlldy1jb25maWcnO1xuaW1wb3J0IHsgVHJlZXZpZXdIZWFkZXJUZW1wbGF0ZUNvbnRleHQgfSBmcm9tICcuLi8uLi9tb2RlbHMvdHJlZXZpZXctaGVhZGVyLXRlbXBsYXRlLWNvbnRleHQnO1xuaW1wb3J0IHsgVHJlZXZpZXdJdGVtVGVtcGxhdGVDb250ZXh0IH0gZnJvbSAnLi4vLi4vbW9kZWxzL3RyZWV2aWV3LWl0ZW0tdGVtcGxhdGUtY29udGV4dCc7XG5pbXBvcnQgeyBUcmVldmlld0hlbHBlciB9IGZyb20gJy4uLy4uL2hlbHBlcnMvdHJlZXZpZXctaGVscGVyJztcbmltcG9ydCB7IFRyZWV2aWV3RXZlbnRQYXJzZXIgfSBmcm9tICcuLi8uLi9oZWxwZXJzL3RyZWV2aWV3LWV2ZW50LXBhcnNlcic7XG5cbmNsYXNzIEZpbHRlclRyZWV2aWV3SXRlbSBleHRlbmRzIFRyZWV2aWV3SXRlbSB7XG4gIHByaXZhdGUgcmVhZG9ubHkgcmVmSXRlbTogVHJlZXZpZXdJdGVtO1xuICBjb25zdHJ1Y3RvcihpdGVtOiBUcmVldmlld0l0ZW0pIHtcbiAgICBzdXBlcih7XG4gICAgICB0ZXh0OiBpdGVtLnRleHQsXG4gICAgICB2YWx1ZTogaXRlbS52YWx1ZSxcbiAgICAgIGRpc2FibGVkOiBpdGVtLmRpc2FibGVkLFxuICAgICAgY2hlY2tlZDogaXRlbS5jaGVja2VkLFxuICAgICAgY29sbGFwc2VkOiBpdGVtLmNvbGxhcHNlZCxcbiAgICAgIGNoaWxkcmVuOiBpdGVtLmNoaWxkcmVuXG4gICAgfSk7XG4gICAgdGhpcy5yZWZJdGVtID0gaXRlbTtcbiAgfVxuXG4gIHVwZGF0ZVJlZkNoZWNrZWQoKTogdm9pZCB7XG4gICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcbiAgICAgIGlmIChjaGlsZCBpbnN0YW5jZW9mIEZpbHRlclRyZWV2aWV3SXRlbSkge1xuICAgICAgICBjaGlsZC51cGRhdGVSZWZDaGVja2VkKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBsZXQgcmVmQ2hlY2tlZCA9IHRoaXMuY2hlY2tlZDtcbiAgICBpZiAocmVmQ2hlY2tlZCkge1xuICAgICAgZm9yIChjb25zdCByZWZDaGlsZCBvZiB0aGlzLnJlZkl0ZW0uY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKCFyZWZDaGlsZC5jaGVja2VkKSB7XG4gICAgICAgICAgcmVmQ2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMucmVmSXRlbS5jaGVja2VkID0gcmVmQ2hlY2tlZDtcbiAgfVxufVxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICduZ3gtdHJlZXZpZXcnLFxuICB0ZW1wbGF0ZVVybDogJy4vdHJlZXZpZXcuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi90cmVldmlldy5jb21wb25lbnQuc2NzcyddXG59KVxuZXhwb3J0IGNsYXNzIFRyZWV2aWV3Q29tcG9uZW50IGltcGxlbWVudHMgT25DaGFuZ2VzLCBPbkluaXQge1xuICBASW5wdXQoKSBoZWFkZXJUZW1wbGF0ZTogVGVtcGxhdGVSZWY8VHJlZXZpZXdIZWFkZXJUZW1wbGF0ZUNvbnRleHQ+O1xuICBASW5wdXQoKSBpdGVtVGVtcGxhdGU6IFRlbXBsYXRlUmVmPFRyZWV2aWV3SXRlbVRlbXBsYXRlQ29udGV4dD47XG4gIEBJbnB1dCgpIGl0ZW1zOiBUcmVldmlld0l0ZW1bXTtcbiAgQElucHV0KCkgY29uZmlnOiBUcmVldmlld0NvbmZpZztcbiAgQE91dHB1dCgpIHNlbGVjdGVkQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxhbnlbXT4oKTtcbiAgQE91dHB1dCgpIGZpbHRlckNoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8c3RyaW5nPigpO1xuICBoZWFkZXJUZW1wbGF0ZUNvbnRleHQ6IFRyZWV2aWV3SGVhZGVyVGVtcGxhdGVDb250ZXh0O1xuICBhbGxJdGVtOiBUcmVldmlld0l0ZW07XG4gIGZpbHRlclRleHQgPSAnJztcbiAgZmlsdGVySXRlbXM6IFRyZWV2aWV3SXRlbVtdO1xuICBzZWxlY3Rpb246IFRyZWV2aWV3U2VsZWN0aW9uO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBpMThuOiBUcmVldmlld0kxOG4sXG4gICAgcHJpdmF0ZSBkZWZhdWx0Q29uZmlnOiBUcmVldmlld0NvbmZpZyxcbiAgICBwcml2YXRlIGV2ZW50UGFyc2VyOiBUcmVldmlld0V2ZW50UGFyc2VyXG4gICkge1xuICAgIHRoaXMuY29uZmlnID0gdGhpcy5kZWZhdWx0Q29uZmlnO1xuICAgIHRoaXMuYWxsSXRlbSA9IG5ldyBUcmVldmlld0l0ZW0oeyB0ZXh0OiAnQWxsJywgdmFsdWU6IHVuZGVmaW5lZCB9KTtcbiAgfVxuXG4gIGdldCBoYXNGaWx0ZXJJdGVtcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gIWlzTmlsKHRoaXMuZmlsdGVySXRlbXMpICYmIHRoaXMuZmlsdGVySXRlbXMubGVuZ3RoID4gMDtcbiAgfVxuXG4gIGdldCBtYXhIZWlnaHQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7dGhpcy5jb25maWcubWF4SGVpZ2h0fWA7XG4gIH1cblxuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLmNyZWF0ZUhlYWRlclRlbXBsYXRlQ29udGV4dCgpO1xuICAgIHRoaXMuZ2VuZXJhdGVTZWxlY3Rpb24oKTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcbiAgICBjb25zdCBpdGVtc1NpbXBsZUNoYW5nZSA9IGNoYW5nZXMuaXRlbXM7XG4gICAgaWYgKCFpc05pbChpdGVtc1NpbXBsZUNoYW5nZSkgJiYgIWlzTmlsKHRoaXMuaXRlbXMpKSB7XG4gICAgICB0aGlzLnVwZGF0ZUZpbHRlckl0ZW1zKCk7XG4gICAgICB0aGlzLnVwZGF0ZUNvbGxhcHNlZE9mQWxsKCk7XG4gICAgICB0aGlzLnJhaXNlU2VsZWN0ZWRDaGFuZ2UoKTtcbiAgICB9XG4gIH1cblxuICBvbkFsbENvbGxhcHNlRXhwYW5kKCk6IHZvaWQge1xuICAgIHRoaXMuYWxsSXRlbS5jb2xsYXBzZWQgPSAhdGhpcy5hbGxJdGVtLmNvbGxhcHNlZDtcbiAgICB0aGlzLmZpbHRlckl0ZW1zLmZvckVhY2goaXRlbSA9PiBpdGVtLnNldENvbGxhcHNlZFJlY3Vyc2l2ZSh0aGlzLmFsbEl0ZW0uY29sbGFwc2VkKSk7XG4gIH1cblxuICBvbkZpbHRlclRleHRDaGFuZ2UodGV4dDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5maWx0ZXJUZXh0ID0gdGV4dDtcbiAgICB0aGlzLmZpbHRlckNoYW5nZS5lbWl0KHRleHQpO1xuICAgIHRoaXMudXBkYXRlRmlsdGVySXRlbXMoKTtcbiAgfVxuXG4gIG9uQWxsQ2hlY2tlZENoYW5nZSgpOiB2b2lkIHtcbiAgICBjb25zdCBjaGVja2VkID0gdGhpcy5hbGxJdGVtLmNoZWNrZWQ7XG4gICAgdGhpcy5maWx0ZXJJdGVtcy5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgaXRlbS5zZXRDaGVja2VkUmVjdXJzaXZlKGNoZWNrZWQpO1xuICAgICAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBGaWx0ZXJUcmVldmlld0l0ZW0pIHtcbiAgICAgICAgaXRlbS51cGRhdGVSZWZDaGVja2VkKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLnJhaXNlU2VsZWN0ZWRDaGFuZ2UoKTtcbiAgfVxuXG4gIG9uSXRlbUNoZWNrZWRDaGFuZ2UoaXRlbTogVHJlZXZpZXdJdGVtLCBjaGVja2VkOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBGaWx0ZXJUcmVldmlld0l0ZW0pIHtcbiAgICAgIGl0ZW0udXBkYXRlUmVmQ2hlY2tlZCgpO1xuICAgIH1cblxuICAgIHRoaXMudXBkYXRlQ2hlY2tlZE9mQWxsKCk7XG4gICAgdGhpcy5yYWlzZVNlbGVjdGVkQ2hhbmdlKCk7XG4gIH1cblxuICByYWlzZVNlbGVjdGVkQ2hhbmdlKCk6IHZvaWQge1xuICAgIHRoaXMuZ2VuZXJhdGVTZWxlY3Rpb24oKTtcbiAgICBjb25zdCB2YWx1ZXMgPSB0aGlzLmV2ZW50UGFyc2VyLmdldFNlbGVjdGVkQ2hhbmdlKHRoaXMpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5zZWxlY3RlZENoYW5nZS5lbWl0KHZhbHVlcyk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZUhlYWRlclRlbXBsYXRlQ29udGV4dCgpOiB2b2lkIHtcbiAgICB0aGlzLmhlYWRlclRlbXBsYXRlQ29udGV4dCA9IHtcbiAgICAgIGNvbmZpZzogdGhpcy5jb25maWcsXG4gICAgICBpdGVtOiB0aGlzLmFsbEl0ZW0sXG4gICAgICBvbkNoZWNrZWRDaGFuZ2U6ICgpID0+IHRoaXMub25BbGxDaGVja2VkQ2hhbmdlKCksXG4gICAgICBvbkNvbGxhcHNlRXhwYW5kOiAoKSA9PiB0aGlzLm9uQWxsQ29sbGFwc2VFeHBhbmQoKSxcbiAgICAgIG9uRmlsdGVyVGV4dENoYW5nZTogKHRleHQpID0+IHRoaXMub25GaWx0ZXJUZXh0Q2hhbmdlKHRleHQpXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgZ2VuZXJhdGVTZWxlY3Rpb24oKTogdm9pZCB7XG4gICAgbGV0IGNoZWNrZWRJdGVtczogVHJlZXZpZXdJdGVtW10gPSBbXTtcbiAgICBsZXQgdW5jaGVja2VkSXRlbXM6IFRyZWV2aWV3SXRlbVtdID0gW107XG4gICAgaWYgKCFpc05pbCh0aGlzLml0ZW1zKSkge1xuICAgICAgY29uc3Qgc2VsZWN0aW9uID0gVHJlZXZpZXdIZWxwZXIuY29uY2F0U2VsZWN0aW9uKHRoaXMuaXRlbXMsIGNoZWNrZWRJdGVtcywgdW5jaGVja2VkSXRlbXMpO1xuICAgICAgY2hlY2tlZEl0ZW1zID0gc2VsZWN0aW9uLmNoZWNrZWQ7XG4gICAgICB1bmNoZWNrZWRJdGVtcyA9IHNlbGVjdGlvbi51bmNoZWNrZWQ7XG4gICAgfVxuXG4gICAgdGhpcy5zZWxlY3Rpb24gPSB7XG4gICAgICBjaGVja2VkSXRlbXMsXG4gICAgICB1bmNoZWNrZWRJdGVtc1xuICAgIH07XG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZUZpbHRlckl0ZW1zKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmZpbHRlclRleHQgIT09ICcnKSB7XG4gICAgICBjb25zdCBmaWx0ZXJJdGVtczogVHJlZXZpZXdJdGVtW10gPSBbXTtcbiAgICAgIGNvbnN0IGZpbHRlclRleHQgPSB0aGlzLmZpbHRlclRleHQudG9Mb3dlckNhc2UoKTtcbiAgICAgIHRoaXMuaXRlbXMuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgY29uc3QgbmV3SXRlbSA9IHRoaXMuZmlsdGVySXRlbShpdGVtLCBmaWx0ZXJUZXh0KTtcbiAgICAgICAgaWYgKCFpc05pbChuZXdJdGVtKSkge1xuICAgICAgICAgIGZpbHRlckl0ZW1zLnB1c2gobmV3SXRlbSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdGhpcy5maWx0ZXJJdGVtcyA9IGZpbHRlckl0ZW1zO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmZpbHRlckl0ZW1zID0gdGhpcy5pdGVtcztcbiAgICB9XG5cbiAgICB0aGlzLnVwZGF0ZUNoZWNrZWRPZkFsbCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBmaWx0ZXJJdGVtKGl0ZW06IFRyZWV2aWV3SXRlbSwgZmlsdGVyVGV4dDogc3RyaW5nKTogVHJlZXZpZXdJdGVtIHtcbiAgICBjb25zdCBpc01hdGNoID0gaW5jbHVkZXMoaXRlbS50ZXh0LnRvTG93ZXJDYXNlKCksIGZpbHRlclRleHQpO1xuICAgIGlmIChpc01hdGNoKSB7XG4gICAgICByZXR1cm4gaXRlbTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFpc05pbChpdGVtLmNoaWxkcmVuKSkge1xuICAgICAgICBjb25zdCBjaGlsZHJlbjogVHJlZXZpZXdJdGVtW10gPSBbXTtcbiAgICAgICAgaXRlbS5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcbiAgICAgICAgICBjb25zdCBuZXdDaGlsZCA9IHRoaXMuZmlsdGVySXRlbShjaGlsZCwgZmlsdGVyVGV4dCk7XG4gICAgICAgICAgaWYgKCFpc05pbChuZXdDaGlsZCkpIHtcbiAgICAgICAgICAgIGNoaWxkcmVuLnB1c2gobmV3Q2hpbGQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgY29uc3QgbmV3SXRlbSA9IG5ldyBGaWx0ZXJUcmVldmlld0l0ZW0oaXRlbSk7XG4gICAgICAgICAgbmV3SXRlbS5jb2xsYXBzZWQgPSBmYWxzZTtcbiAgICAgICAgICBuZXdJdGVtLmNoaWxkcmVuID0gY2hpbGRyZW47XG4gICAgICAgICAgcmV0dXJuIG5ld0l0ZW07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVDaGVja2VkT2ZBbGwoKTogdm9pZCB7XG4gICAgbGV0IGl0ZW1DaGVja2VkOiBib29sZWFuID0gbnVsbDtcbiAgICBmb3IgKGNvbnN0IGZpbHRlckl0ZW0gb2YgdGhpcy5maWx0ZXJJdGVtcykge1xuICAgICAgaWYgKGl0ZW1DaGVja2VkID09PSBudWxsKSB7XG4gICAgICAgIGl0ZW1DaGVja2VkID0gZmlsdGVySXRlbS5jaGVja2VkO1xuICAgICAgfSBlbHNlIGlmIChpdGVtQ2hlY2tlZCAhPT0gZmlsdGVySXRlbS5jaGVja2VkKSB7XG4gICAgICAgIGl0ZW1DaGVja2VkID0gdW5kZWZpbmVkO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaXRlbUNoZWNrZWQgPT09IG51bGwpIHtcbiAgICAgIGl0ZW1DaGVja2VkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy5hbGxJdGVtLmNoZWNrZWQgPSBpdGVtQ2hlY2tlZDtcbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlQ29sbGFwc2VkT2ZBbGwoKTogdm9pZCB7XG4gICAgbGV0IGhhc0l0ZW1FeHBhbmRlZCA9IGZhbHNlO1xuICAgIGZvciAoY29uc3QgZmlsdGVySXRlbSBvZiB0aGlzLmZpbHRlckl0ZW1zKSB7XG4gICAgICBpZiAoIWZpbHRlckl0ZW0uY29sbGFwc2VkKSB7XG4gICAgICAgIGhhc0l0ZW1FeHBhbmRlZCA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuYWxsSXRlbS5jb2xsYXBzZWQgPSAhaGFzSXRlbUV4cGFuZGVkO1xuICB9XG59XG4iXX0=