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
            hidden: item.hidden,
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
        this.showHidden = false;
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
    onFilterShowHiddenChange(showHidden) {
        this.showHidden = showHidden;
        this.filterChange.emit(`${showHidden}`);
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
            onFilterTextChange: (text) => this.onFilterTextChange(text),
            onFilterShowHiddenChange: (showHidden) => this.onFilterShowHiddenChange(showHidden)
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
                    if (this.config.filterHidden) {
                        const filteredHiddenItem = this.filterItemHidden(newItem, this.showHidden);
                        if (!isNil(filteredHiddenItem)) {
                            filterItems.push(filteredHiddenItem);
                        }
                    }
                    else {
                        filterItems.push(newItem);
                    }
                }
            });
            this.filterItems = filterItems;
        }
        else {
            const filterItems = [];
            this.items.forEach(item => {
                const newItem = this.filterItemHidden(item, this.showHidden);
                if (!isNil(newItem)) {
                    filterItems.push(newItem);
                }
            });
            this.filterItems = filterItems;
        }
        this.updateCheckedOfAll();
    }
    filterItemHidden(item, showHidden) {
        if (!showHidden && this.config.filterHidden) {
            if (item.hidden) {
                return undefined;
            }
            else {
                if (!isNil(item.children)) {
                    const children = [];
                    item.children.forEach(child => {
                        const newChild = this.filterItemHidden(child, showHidden);
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
                    else {
                        const newItem = new FilterTreeviewItem(item);
                        newItem.collapsed = false;
                        newItem.children = [];
                        return newItem;
                    }
                }
            }
        }
        else {
            return item;
        }
        return item;
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
                template: "<ng-template #defaultItemTemplate let-item=\"item\" let-onCollapseExpand=\"onCollapseExpand\"\n  let-onCheckedChange=\"onCheckedChange\">\n  <div class=\"form-inline row-item\">\n    <i *ngIf=\"item.children\" (click)=\"onCollapseExpand()\" aria-hidden=\"true\" [ngSwitch]=\"item.collapsed\">\n      <svg *ngSwitchCase=\"true\" width=\"0.8rem\" height=\"0.8rem\" viewBox=\"0 0 16 16\" class=\"bi bi-caret-right-fill\"\n        fill=\"currentColor\" xmlns=\"http://www.w3.org/2000/svg\">\n        <path\n          d=\"M12.14 8.753l-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z\" />\n      </svg>\n      <svg *ngSwitchCase=\"false\" width=\"0.8rem\" height=\"0.8rem\" viewBox=\"0 0 16 16\" class=\"bi bi-caret-down-fill\"\n        fill=\"currentColor\" xmlns=\"http://www.w3.org/2000/svg\">\n        <path\n          d=\"M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z\" />\n      </svg>\n    </i>\n    <div class=\"form-check\">\n      <input type=\"checkbox\" class=\"form-check-input\" [(ngModel)]=\"item.checked\" (ngModelChange)=\"onCheckedChange()\"\n        [disabled]=\"item.disabled\" [indeterminate]=\"item.indeterminate\" />\n      <label class=\"form-check-label\" (click)=\"item.checked = !item.checked; onCheckedChange()\">\n        {{item.text}}\n      </label>\n    </div>\n  </div>\n</ng-template>\n<ng-template #defaultHeaderTemplate let-config=\"config\" let-item=\"item\" let-onCollapseExpand=\"onCollapseExpand\"\n  let-onCheckedChange=\"onCheckedChange\" let-onFilterTextChange=\"onFilterTextChange\" let-onFilterShowHiddenChange=\"onFilterShowHiddenChange\">\n  <div *ngIf=\"config.hasFilter\" class=\"row row-filter\">\n    <div class=\"col-12\">\n      <input class=\"form-control\" type=\"text\" [placeholder]=\"i18n.getFilterPlaceholder()\" [(ngModel)]=\"filterText\"\n        (ngModelChange)=\"onFilterTextChange($event)\" />\n    </div>\n    <div class=\"col-12\" style=\"margin-top: 10px\" *ngIf=\"config.filterHidden\">\n      <input class=\"form-check-input\" id=\"filterToggle\" style=\"margin-right: 7px;\" type=\"checkbox\" [(ngModel)]=\"showHidden\"\n             (ngModelChange)=\"onFilterShowHiddenChange($event)\" />\n      <label class=\"form-check-label\" for=\"filterToggle\">Show Hidden</label>\n    </div>\n  </div>\n  <div *ngIf=\"hasFilterItems\">\n    <div *ngIf=\"config.hasAllCheckBox || config.hasCollapseExpand\" class=\"row row-all\">\n      <div class=\"col-12\">\n        <div class=\"form-check form-check-inline\" *ngIf=\"config.hasAllCheckBox\">\n          <input type=\"checkbox\" class=\"form-check-input\" [(ngModel)]=\"item.checked\" (ngModelChange)=\"onCheckedChange()\"\n            [indeterminate]=\"item.indeterminate\" />\n          <label class=\"form-check-label\" (click)=\"item.checked = !item.checked; onCheckedChange()\">\n            {{i18n.getAllCheckboxText()}}\n          </label>\n        </div>\n        <label *ngIf=\"config.hasCollapseExpand\" class=\"float-right form-check-label\" (click)=\"onCollapseExpand()\">\n          <i [title]=\"i18n.getTooltipCollapseExpandText(item.collapsed)\" aria-hidden=\"true\" [ngSwitch]=\"item.collapsed\">\n            <svg *ngSwitchCase=\"true\" width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-arrows-angle-expand\"\n              fill=\"currentColor\" xmlns=\"http://www.w3.org/2000/svg\">\n              <path fill-rule=\"evenodd\"\n                d=\"M1.5 10.036a.5.5 0 0 1 .5.5v3.5h3.5a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 .5-.5z\" />\n              <path fill-rule=\"evenodd\"\n                d=\"M6.354 9.646a.5.5 0 0 1 0 .708l-4.5 4.5a.5.5 0 0 1-.708-.708l4.5-4.5a.5.5 0 0 1 .708 0zm8.5-8.5a.5.5 0 0 1 0 .708l-4.5 4.5a.5.5 0 0 1-.708-.708l4.5-4.5a.5.5 0 0 1 .708 0z\" />\n              <path fill-rule=\"evenodd\"\n                d=\"M10.036 1.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 1 1-1 0V2h-3.5a.5.5 0 0 1-.5-.5z\" />\n            </svg>\n            <svg *ngSwitchCase=\"false\" width=\"1em\" height=\"1em\" viewBox=\"0 0 16 16\" class=\"bi bi-arrows-angle-contract\"\n              fill=\"currentColor\" xmlns=\"http://www.w3.org/2000/svg\">\n              <path fill-rule=\"evenodd\"\n                d=\"M9.5 2.036a.5.5 0 0 1 .5.5v3.5h3.5a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 .5-.5z\" />\n              <path fill-rule=\"evenodd\"\n                d=\"M14.354 1.646a.5.5 0 0 1 0 .708l-4.5 4.5a.5.5 0 1 1-.708-.708l4.5-4.5a.5.5 0 0 1 .708 0zm-7.5 7.5a.5.5 0 0 1 0 .708l-4.5 4.5a.5.5 0 0 1-.708-.708l4.5-4.5a.5.5 0 0 1 .708 0z\" />\n              <path fill-rule=\"evenodd\"\n                d=\"M2.036 9.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V10h-3.5a.5.5 0 0 1-.5-.5z\" />\n            </svg>\n          </i>\n        </label>\n      </div>\n    </div>\n    <div *ngIf=\"config.hasDivider\" class=\"dropdown-divider\"></div>\n  </div>\n</ng-template>\n<div class=\"treeview-header\">\n  <ng-template [ngTemplateOutlet]=\"headerTemplate || defaultHeaderTemplate\"\n    [ngTemplateOutletContext]=\"headerTemplateContext\">\n  </ng-template>\n</div>\n<div [ngSwitch]=\"hasFilterItems\">\n  <div *ngSwitchCase=\"true\" class=\"treeview-container\" [style.max-height.px]=\"maxHeight\">\n    <ngx-treeview-item *ngFor=\"let item of filterItems\" [config]=\"config\" [item]=\"item\"\n      [template]=\"itemTemplate || defaultItemTemplate\" (checkedChange)=\"onItemCheckedChange(item, $event)\">\n    </ngx-treeview-item>\n  </div>\n  <div *ngSwitchCase=\"false\" class=\"treeview-text\">\n    {{i18n.getFilterNoItemsFoundText()}}\n  </div>\n</div>\n",
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZXZpZXcuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LXRyZWV2aWV3L3NyYy9saWIvY29tcG9uZW50cy90cmVldmlldy90cmVldmlldy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBaUQsTUFBTSxlQUFlLENBQUM7QUFDdEgsT0FBTyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFDekMsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzFELE9BQU8sRUFBRSxZQUFZLEVBQXFCLE1BQU0sNEJBQTRCLENBQUM7QUFDN0UsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRzlELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUMvRCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUUxRSxNQUFNLGtCQUFtQixTQUFRLFlBQVk7SUFFM0MsWUFBWSxJQUFrQjtRQUM1QixLQUFLLENBQUM7WUFDSixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7WUFDZixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7WUFDakIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO1lBQ3ZCLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztZQUNyQixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07WUFDbkIsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO1lBQ3pCLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtTQUN4QixDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztJQUN0QixDQUFDO0lBRUQsZ0JBQWdCO1FBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FB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LENBQUM7SUFDckMsQ0FBQztJQUVPLG9CQUFvQjtRQUMxQixJQUFJLGVBQWUsR0FBRyxLQUFLLENBQUM7UUFDNUIsS0FBSyxNQUFNLFVBQVUsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ3pDLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFO2dCQUN6QixlQUFlLEdBQUcsSUFBSSxDQUFDO2dCQUN2QixNQUFNO2FBQ1A7U0FDRjtRQUVELElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLENBQUMsZUFBZSxDQUFDO0lBQzVDLENBQUM7OztZQWpQRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLGNBQWM7Z0JBQ3hCLHFpTEFBd0M7O2FBRXpDOzs7WUEvQ1EsWUFBWTtZQUVaLGNBQWM7WUFJZCxtQkFBbUI7Ozs2QkEyQ3pCLEtBQUs7MkJBQ0wsS0FBSztvQkFDTCxLQUFLO3FCQUNMLEtBQUs7NkJBQ0wsTUFBTTsyQkFDTixNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbnB1dCwgT3V0cHV0LCBFdmVudEVtaXR0ZXIsIFNpbXBsZUNoYW5nZXMsIE9uQ2hhbmdlcywgVGVtcGxhdGVSZWYsIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgaXNOaWwsIGluY2x1ZGVzIH0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IFRyZWV2aWV3STE4biB9IGZyb20gJy4uLy4uL21vZGVscy90cmVldmlldy1pMThuJztcbmltcG9ydCB7IFRyZWV2aWV3SXRlbSwgVHJlZXZpZXdTZWxlY3Rpb24gfSBmcm9tICcuLi8uLi9tb2RlbHMvdHJlZXZpZXctaXRlbSc7XG5pbXBvcnQgeyBUcmVldmlld0NvbmZpZyB9IGZyb20gJy4uLy4uL21vZGVscy90cmVldmlldy1jb25maWcnO1xuaW1wb3J0IHsgVHJlZXZpZXdIZWFkZXJUZW1wbGF0ZUNvbnRleHQgfSBmcm9tICcuLi8uLi9tb2RlbHMvdHJlZXZpZXctaGVhZGVyLXRlbXBsYXRlLWNvbnRleHQnO1xuaW1wb3J0IHsgVHJlZXZpZXdJdGVtVGVtcGxhdGVDb250ZXh0IH0gZnJvbSAnLi4vLi4vbW9kZWxzL3RyZWV2aWV3LWl0ZW0tdGVtcGxhdGUtY29udGV4dCc7XG5pbXBvcnQgeyBUcmVldmlld0hlbHBlciB9IGZyb20gJy4uLy4uL2hlbHBlcnMvdHJlZXZpZXctaGVscGVyJztcbmltcG9ydCB7IFRyZWV2aWV3RXZlbnRQYXJzZXIgfSBmcm9tICcuLi8uLi9oZWxwZXJzL3RyZWV2aWV3LWV2ZW50LXBhcnNlcic7XG5cbmNsYXNzIEZpbHRlclRyZWV2aWV3SXRlbSBleHRlbmRzIFRyZWV2aWV3SXRlbSB7XG4gIHByaXZhdGUgcmVhZG9ubHkgcmVmSXRlbTogVHJlZXZpZXdJdGVtO1xuICBjb25zdHJ1Y3RvcihpdGVtOiBUcmVldmlld0l0ZW0pIHtcbiAgICBzdXBlcih7XG4gICAgICB0ZXh0OiBpdGVtLnRleHQsXG4gICAgICB2YWx1ZTogaXRlbS52YWx1ZSxcbiAgICAgIGRpc2FibGVkOiBpdGVtLmRpc2FibGVkLFxuICAgICAgY2hlY2tlZDogaXRlbS5jaGVja2VkLFxuICAgICAgaGlkZGVuOiBpdGVtLmhpZGRlbixcbiAgICAgIGNvbGxhcHNlZDogaXRlbS5jb2xsYXBzZWQsXG4gICAgICBjaGlsZHJlbjogaXRlbS5jaGlsZHJlblxuICAgIH0pO1xuICAgIHRoaXMucmVmSXRlbSA9IGl0ZW07XG4gIH1cblxuICB1cGRhdGVSZWZDaGVja2VkKCk6IHZvaWQge1xuICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XG4gICAgICBpZiAoY2hpbGQgaW5zdGFuY2VvZiBGaWx0ZXJUcmVldmlld0l0ZW0pIHtcbiAgICAgICAgY2hpbGQudXBkYXRlUmVmQ2hlY2tlZCgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgbGV0IHJlZkNoZWNrZWQgPSB0aGlzLmNoZWNrZWQ7XG4gICAgaWYgKHJlZkNoZWNrZWQpIHtcbiAgICAgIGZvciAoY29uc3QgcmVmQ2hpbGQgb2YgdGhpcy5yZWZJdGVtLmNoaWxkcmVuKSB7XG4gICAgICAgIGlmICghcmVmQ2hpbGQuY2hlY2tlZCkge1xuICAgICAgICAgIHJlZkNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnJlZkl0ZW0uY2hlY2tlZCA9IHJlZkNoZWNrZWQ7XG4gIH1cbn1cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbmd4LXRyZWV2aWV3JyxcbiAgdGVtcGxhdGVVcmw6ICcuL3RyZWV2aWV3LmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJy4vdHJlZXZpZXcuY29tcG9uZW50LnNjc3MnXVxufSlcbmV4cG9ydCBjbGFzcyBUcmVldmlld0NvbXBvbmVudCBpbXBsZW1lbnRzIE9uQ2hhbmdlcywgT25Jbml0IHtcbiAgQElucHV0KCkgaGVhZGVyVGVtcGxhdGU6IFRlbXBsYXRlUmVmPFRyZWV2aWV3SGVhZGVyVGVtcGxhdGVDb250ZXh0PjtcbiAgQElucHV0KCkgaXRlbVRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxUcmVldmlld0l0ZW1UZW1wbGF0ZUNvbnRleHQ+O1xuICBASW5wdXQoKSBpdGVtczogVHJlZXZpZXdJdGVtW107XG4gIEBJbnB1dCgpIGNvbmZpZzogVHJlZXZpZXdDb25maWc7XG4gIEBPdXRwdXQoKSBzZWxlY3RlZENoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8YW55W10+KCk7XG4gIEBPdXRwdXQoKSBmaWx0ZXJDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPHN0cmluZz4oKTtcbiAgaGVhZGVyVGVtcGxhdGVDb250ZXh0OiBUcmVldmlld0hlYWRlclRlbXBsYXRlQ29udGV4dDtcbiAgYWxsSXRlbTogVHJlZXZpZXdJdGVtO1xuICBmaWx0ZXJUZXh0ID0gJyc7XG4gIHNob3dIaWRkZW4gPSBmYWxzZTtcbiAgZmlsdGVySXRlbXM6IFRyZWV2aWV3SXRlbVtdO1xuICBzZWxlY3Rpb246IFRyZWV2aWV3U2VsZWN0aW9uO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBpMThuOiBUcmVldmlld0kxOG4sXG4gICAgcHJpdmF0ZSBkZWZhdWx0Q29uZmlnOiBUcmVldmlld0NvbmZpZyxcbiAgICBwcml2YXRlIGV2ZW50UGFyc2VyOiBUcmVldmlld0V2ZW50UGFyc2VyXG4gICkge1xuICAgIHRoaXMuY29uZmlnID0gdGhpcy5kZWZhdWx0Q29uZmlnO1xuICAgIHRoaXMuYWxsSXRlbSA9IG5ldyBUcmVldmlld0l0ZW0oeyB0ZXh0OiAnQWxsJywgdmFsdWU6IHVuZGVmaW5lZCB9KTtcbiAgfVxuXG4gIGdldCBoYXNGaWx0ZXJJdGVtcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gIWlzTmlsKHRoaXMuZmlsdGVySXRlbXMpICYmIHRoaXMuZmlsdGVySXRlbXMubGVuZ3RoID4gMDtcbiAgfVxuXG4gIGdldCBtYXhIZWlnaHQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7dGhpcy5jb25maWcubWF4SGVpZ2h0fWA7XG4gIH1cblxuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLmNyZWF0ZUhlYWRlclRlbXBsYXRlQ29udGV4dCgpO1xuICAgIHRoaXMuZ2VuZXJhdGVTZWxlY3Rpb24oKTtcbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcbiAgICBjb25zdCBpdGVtc1NpbXBsZUNoYW5nZSA9IGNoYW5nZXMuaXRlbXM7XG4gICAgaWYgKCFpc05pbChpdGVtc1NpbXBsZUNoYW5nZSkgJiYgIWlzTmlsKHRoaXMuaXRlbXMpKSB7XG4gICAgICB0aGlzLnVwZGF0ZUZpbHRlckl0ZW1zKCk7XG4gICAgICB0aGlzLnVwZGF0ZUNvbGxhcHNlZE9mQWxsKCk7XG4gICAgICB0aGlzLnJhaXNlU2VsZWN0ZWRDaGFuZ2UoKTtcbiAgICB9XG4gIH1cblxuICBvbkFsbENvbGxhcHNlRXhwYW5kKCk6IHZvaWQge1xuICAgIHRoaXMuYWxsSXRlbS5jb2xsYXBzZWQgPSAhdGhpcy5hbGxJdGVtLmNvbGxhcHNlZDtcbiAgICB0aGlzLmZpbHRlckl0ZW1zLmZvckVhY2goaXRlbSA9PiBpdGVtLnNldENvbGxhcHNlZFJlY3Vyc2l2ZSh0aGlzLmFsbEl0ZW0uY29sbGFwc2VkKSk7XG4gIH1cblxuICBvbkZpbHRlclRleHRDaGFuZ2UodGV4dDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5maWx0ZXJUZXh0ID0gdGV4dDtcbiAgICB0aGlzLmZpbHRlckNoYW5nZS5lbWl0KHRleHQpO1xuICAgIHRoaXMudXBkYXRlRmlsdGVySXRlbXMoKTtcbiAgfVxuXG4gIG9uRmlsdGVyU2hvd0hpZGRlbkNoYW5nZShzaG93SGlkZGVuOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5zaG93SGlkZGVuID0gc2hvd0hpZGRlbjtcbiAgICB0aGlzLmZpbHRlckNoYW5nZS5lbWl0KGAke3Nob3dIaWRkZW59YCk7XG4gICAgdGhpcy51cGRhdGVGaWx0ZXJJdGVtcygpO1xuICB9XG5cbiAgb25BbGxDaGVja2VkQ2hhbmdlKCk6IHZvaWQge1xuICAgIGNvbnN0IGNoZWNrZWQgPSB0aGlzLmFsbEl0ZW0uY2hlY2tlZDtcbiAgICB0aGlzLmZpbHRlckl0ZW1zLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICBpdGVtLnNldENoZWNrZWRSZWN1cnNpdmUoY2hlY2tlZCk7XG4gICAgICBpZiAoaXRlbSBpbnN0YW5jZW9mIEZpbHRlclRyZWV2aWV3SXRlbSkge1xuICAgICAgICBpdGVtLnVwZGF0ZVJlZkNoZWNrZWQoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMucmFpc2VTZWxlY3RlZENoYW5nZSgpO1xuICB9XG5cbiAgb25JdGVtQ2hlY2tlZENoYW5nZShpdGVtOiBUcmVldmlld0l0ZW0sIGNoZWNrZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAoaXRlbSBpbnN0YW5jZW9mIEZpbHRlclRyZWV2aWV3SXRlbSkge1xuICAgICAgaXRlbS51cGRhdGVSZWZDaGVja2VkKCk7XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVDaGVja2VkT2ZBbGwoKTtcbiAgICB0aGlzLnJhaXNlU2VsZWN0ZWRDaGFuZ2UoKTtcbiAgfVxuXG4gIHJhaXNlU2VsZWN0ZWRDaGFuZ2UoKTogdm9pZCB7XG4gICAgdGhpcy5nZW5lcmF0ZVNlbGVjdGlvbigpO1xuICAgIGNvbnN0IHZhbHVlcyA9IHRoaXMuZXZlbnRQYXJzZXIuZ2V0U2VsZWN0ZWRDaGFuZ2UodGhpcyk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLnNlbGVjdGVkQ2hhbmdlLmVtaXQodmFsdWVzKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlSGVhZGVyVGVtcGxhdGVDb250ZXh0KCk6IHZvaWQge1xuICAgIHRoaXMuaGVhZGVyVGVtcGxhdGVDb250ZXh0ID0ge1xuICAgICAgY29uZmlnOiB0aGlzLmNvbmZpZyxcbiAgICAgIGl0ZW06IHRoaXMuYWxsSXRlbSxcbiAgICAgIG9uQ2hlY2tlZENoYW5nZTogKCkgPT4gdGhpcy5vbkFsbENoZWNrZWRDaGFuZ2UoKSxcbiAgICAgIG9uQ29sbGFwc2VFeHBhbmQ6ICgpID0+IHRoaXMub25BbGxDb2xsYXBzZUV4cGFuZCgpLFxuICAgICAgb25GaWx0ZXJUZXh0Q2hhbmdlOiAodGV4dCkgPT4gdGhpcy5vbkZpbHRlclRleHRDaGFuZ2UodGV4dCksXG4gICAgICBvbkZpbHRlclNob3dIaWRkZW5DaGFuZ2U6IChzaG93SGlkZGVuKSA9PiB0aGlzLm9uRmlsdGVyU2hvd0hpZGRlbkNoYW5nZShzaG93SGlkZGVuKVxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIGdlbmVyYXRlU2VsZWN0aW9uKCk6IHZvaWQge1xuICAgIGxldCBjaGVja2VkSXRlbXM6IFRyZWV2aWV3SXRlbVtdID0gW107XG4gICAgbGV0IHVuY2hlY2tlZEl0ZW1zOiBUcmVldmlld0l0ZW1bXSA9IFtdO1xuICAgIGlmICghaXNOaWwodGhpcy5pdGVtcykpIHtcbiAgICAgIGNvbnN0IHNlbGVjdGlvbiA9IFRyZWV2aWV3SGVscGVyLmNvbmNhdFNlbGVjdGlvbih0aGlzLml0ZW1zLCBjaGVja2VkSXRlbXMsIHVuY2hlY2tlZEl0ZW1zKTtcbiAgICAgIGNoZWNrZWRJdGVtcyA9IHNlbGVjdGlvbi5jaGVja2VkO1xuICAgICAgdW5jaGVja2VkSXRlbXMgPSBzZWxlY3Rpb24udW5jaGVja2VkO1xuICAgIH1cblxuICAgIHRoaXMuc2VsZWN0aW9uID0ge1xuICAgICAgY2hlY2tlZEl0ZW1zLFxuICAgICAgdW5jaGVja2VkSXRlbXNcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVGaWx0ZXJJdGVtcygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5maWx0ZXJUZXh0ICE9PSAnJykge1xuICAgICAgY29uc3QgZmlsdGVySXRlbXM6IFRyZWV2aWV3SXRlbVtdID0gW107XG4gICAgICBjb25zdCBmaWx0ZXJUZXh0ID0gdGhpcy5maWx0ZXJUZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgICB0aGlzLml0ZW1zLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld0l0ZW0gPSB0aGlzLmZpbHRlckl0ZW0oaXRlbSwgZmlsdGVyVGV4dCk7XG4gICAgICAgIGlmICghaXNOaWwobmV3SXRlbSkpIHtcbiAgICAgICAgICBpZiAodGhpcy5jb25maWcuZmlsdGVySGlkZGVuKSB7XG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJlZEhpZGRlbkl0ZW0gPSB0aGlzLmZpbHRlckl0ZW1IaWRkZW4obmV3SXRlbSwgdGhpcy5zaG93SGlkZGVuKTtcblxuICAgICAgICAgICAgaWYgKCFpc05pbChmaWx0ZXJlZEhpZGRlbkl0ZW0pKSB7XG4gICAgICAgICAgICAgIGZpbHRlckl0ZW1zLnB1c2goZmlsdGVyZWRIaWRkZW5JdGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmlsdGVySXRlbXMucHVzaChuZXdJdGVtKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdGhpcy5maWx0ZXJJdGVtcyA9IGZpbHRlckl0ZW1zO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBmaWx0ZXJJdGVtczogVHJlZXZpZXdJdGVtW10gPSBbXTtcbiAgICAgIHRoaXMuaXRlbXMuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgY29uc3QgbmV3SXRlbSA9IHRoaXMuZmlsdGVySXRlbUhpZGRlbihpdGVtLCB0aGlzLnNob3dIaWRkZW4pO1xuICAgICAgICBpZiAoIWlzTmlsKG5ld0l0ZW0pKSB7XG4gICAgICAgICAgZmlsdGVySXRlbXMucHVzaChuZXdJdGVtKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0aGlzLmZpbHRlckl0ZW1zID0gZmlsdGVySXRlbXM7XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVDaGVja2VkT2ZBbGwoKTtcbiAgfVxuXG4gIHByaXZhdGUgZmlsdGVySXRlbUhpZGRlbihpdGVtOiBUcmVldmlld0l0ZW0sIHNob3dIaWRkZW46IGJvb2xlYW4pIHtcbiAgICBpZiAoIXNob3dIaWRkZW4gJiYgdGhpcy5jb25maWcuZmlsdGVySGlkZGVuKSB7XG4gICAgICBpZiAoaXRlbS5oaWRkZW4pIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghaXNOaWwoaXRlbS5jaGlsZHJlbikpIHtcbiAgICAgICAgICBjb25zdCBjaGlsZHJlbjogVHJlZXZpZXdJdGVtW10gPSBbXTtcbiAgICAgICAgICBpdGVtLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3Q2hpbGQgPSB0aGlzLmZpbHRlckl0ZW1IaWRkZW4oY2hpbGQsIHNob3dIaWRkZW4pO1xuICAgICAgICAgICAgaWYgKCFpc05pbChuZXdDaGlsZCkpIHtcbiAgICAgICAgICAgICAgY2hpbGRyZW4ucHVzaChuZXdDaGlsZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnN0IG5ld0l0ZW0gPSBuZXcgRmlsdGVyVHJlZXZpZXdJdGVtKGl0ZW0pO1xuICAgICAgICAgICAgbmV3SXRlbS5jb2xsYXBzZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIG5ld0l0ZW0uY2hpbGRyZW4gPSBjaGlsZHJlbjtcbiAgICAgICAgICAgIHJldHVybiBuZXdJdGVtO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBuZXdJdGVtID0gbmV3IEZpbHRlclRyZWV2aWV3SXRlbShpdGVtKTtcbiAgICAgICAgICAgIG5ld0l0ZW0uY29sbGFwc2VkID0gZmFsc2U7XG4gICAgICAgICAgICBuZXdJdGVtLmNoaWxkcmVuID0gW107XG4gICAgICAgICAgICByZXR1cm4gbmV3SXRlbTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGl0ZW07XG4gICAgfVxuXG4gICAgcmV0dXJuIGl0ZW07XG4gIH1cblxuICBwcml2YXRlIGZpbHRlckl0ZW0oaXRlbTogVHJlZXZpZXdJdGVtLCBmaWx0ZXJUZXh0OiBzdHJpbmcpOiBUcmVldmlld0l0ZW0ge1xuICAgIGNvbnN0IGlzTWF0Y2ggPSBpbmNsdWRlcyhpdGVtLnRleHQudG9Mb3dlckNhc2UoKSwgZmlsdGVyVGV4dCk7XG4gICAgaWYgKGlzTWF0Y2gpIHtcbiAgICAgIHJldHVybiBpdGVtO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIWlzTmlsKGl0ZW0uY2hpbGRyZW4pKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkcmVuOiBUcmVldmlld0l0ZW1bXSA9IFtdO1xuICAgICAgICBpdGVtLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xuICAgICAgICAgIGNvbnN0IG5ld0NoaWxkID0gdGhpcy5maWx0ZXJJdGVtKGNoaWxkLCBmaWx0ZXJUZXh0KTtcbiAgICAgICAgICBpZiAoIWlzTmlsKG5ld0NoaWxkKSkge1xuICAgICAgICAgICAgY2hpbGRyZW4ucHVzaChuZXdDaGlsZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBjb25zdCBuZXdJdGVtID0gbmV3IEZpbHRlclRyZWV2aWV3SXRlbShpdGVtKTtcbiAgICAgICAgICBuZXdJdGVtLmNvbGxhcHNlZCA9IGZhbHNlO1xuICAgICAgICAgIG5ld0l0ZW0uY2hpbGRyZW4gPSBjaGlsZHJlbjtcbiAgICAgICAgICByZXR1cm4gbmV3SXRlbTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZUNoZWNrZWRPZkFsbCgpOiB2b2lkIHtcbiAgICBsZXQgaXRlbUNoZWNrZWQ6IGJvb2xlYW4gPSBudWxsO1xuICAgIGZvciAoY29uc3QgZmlsdGVySXRlbSBvZiB0aGlzLmZpbHRlckl0ZW1zKSB7XG4gICAgICBpZiAoaXRlbUNoZWNrZWQgPT09IG51bGwpIHtcbiAgICAgICAgaXRlbUNoZWNrZWQgPSBmaWx0ZXJJdGVtLmNoZWNrZWQ7XG4gICAgICB9IGVsc2UgaWYgKGl0ZW1DaGVja2VkICE9PSBmaWx0ZXJJdGVtLmNoZWNrZWQpIHtcbiAgICAgICAgaXRlbUNoZWNrZWQgPSB1bmRlZmluZWQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChpdGVtQ2hlY2tlZCA9PT0gbnVsbCkge1xuICAgICAgaXRlbUNoZWNrZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLmFsbEl0ZW0uY2hlY2tlZCA9IGl0ZW1DaGVja2VkO1xuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVDb2xsYXBzZWRPZkFsbCgpOiB2b2lkIHtcbiAgICBsZXQgaGFzSXRlbUV4cGFuZGVkID0gZmFsc2U7XG4gICAgZm9yIChjb25zdCBmaWx0ZXJJdGVtIG9mIHRoaXMuZmlsdGVySXRlbXMpIHtcbiAgICAgIGlmICghZmlsdGVySXRlbS5jb2xsYXBzZWQpIHtcbiAgICAgICAgaGFzSXRlbUV4cGFuZGVkID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5hbGxJdGVtLmNvbGxhcHNlZCA9ICFoYXNJdGVtRXhwYW5kZWQ7XG4gIH1cbn1cbiJdfQ==