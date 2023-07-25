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
        this.filterText = '';
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
                        const newItem = new FilterTreeviewItem(new TreeviewItem({
                            text: item.text,
                            value: item.value,
                            disabled: item.disabled,
                            checked: item.checked,
                            hidden: item.hidden,
                            collapsed: item.collapsed,
                            children: []
                        }));
                        newItem.collapsed = false;
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
        if (isMatch && (this.showHidden || (!this.showHidden && !item.hidden))) {
            return item;
        }
        else {
            if (!isNil(item.children) && ((!this.showHidden && !item.hidden) || this.showHidden)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZXZpZXcuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LXRyZWV2aWV3L3NyYy9saWIvY29tcG9uZW50cy90cmVldmlldy90cmVldmlldy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBaUQsTUFBTSxlQUFlLENBQUM7QUFDdEgsT0FBTyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFDekMsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzFELE9BQU8sRUFBRSxZQUFZLEVBQXFCLE1BQU0sNEJBQTRCLENBQUM7QUFDN0UsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRzlELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUMvRCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUUxRSxNQUFNLGtCQUFtQixTQUFRLFlBQVk7SUFFM0MsWUFBWSxJQUFrQjtRQUM1QixLQUFLLENBQUM7WUFDSixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7WUFDZixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7WUFDakIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO1lBQ3ZCLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztZQUNyQixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07WUFDbkIsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO1lBQ3pCLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtTQUN4QixDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztJQUN0QixDQUFDO0lBRUQsZ0JBQWdCO1FBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FB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U2ltcGxlQ2hhbmdlcywgT25DaGFuZ2VzLCBUZW1wbGF0ZVJlZiwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBpc05pbCwgaW5jbHVkZXMgfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgVHJlZXZpZXdJMThuIH0gZnJvbSAnLi4vLi4vbW9kZWxzL3RyZWV2aWV3LWkxOG4nO1xuaW1wb3J0IHsgVHJlZXZpZXdJdGVtLCBUcmVldmlld1NlbGVjdGlvbiB9IGZyb20gJy4uLy4uL21vZGVscy90cmVldmlldy1pdGVtJztcbmltcG9ydCB7IFRyZWV2aWV3Q29uZmlnIH0gZnJvbSAnLi4vLi4vbW9kZWxzL3RyZWV2aWV3LWNvbmZpZyc7XG5pbXBvcnQgeyBUcmVldmlld0hlYWRlclRlbXBsYXRlQ29udGV4dCB9IGZyb20gJy4uLy4uL21vZGVscy90cmVldmlldy1oZWFkZXItdGVtcGxhdGUtY29udGV4dCc7XG5pbXBvcnQgeyBUcmVldmlld0l0ZW1UZW1wbGF0ZUNvbnRleHQgfSBmcm9tICcuLi8uLi9tb2RlbHMvdHJlZXZpZXctaXRlbS10ZW1wbGF0ZS1jb250ZXh0JztcbmltcG9ydCB7IFRyZWV2aWV3SGVscGVyIH0gZnJvbSAnLi4vLi4vaGVscGVycy90cmVldmlldy1oZWxwZXInO1xuaW1wb3J0IHsgVHJlZXZpZXdFdmVudFBhcnNlciB9IGZyb20gJy4uLy4uL2hlbHBlcnMvdHJlZXZpZXctZXZlbnQtcGFyc2VyJztcblxuY2xhc3MgRmlsdGVyVHJlZXZpZXdJdGVtIGV4dGVuZHMgVHJlZXZpZXdJdGVtIHtcbiAgcHJpdmF0ZSByZWFkb25seSByZWZJdGVtOiBUcmVldmlld0l0ZW07XG4gIGNvbnN0cnVjdG9yKGl0ZW06IFRyZWV2aWV3SXRlbSkge1xuICAgIHN1cGVyKHtcbiAgICAgIHRleHQ6IGl0ZW0udGV4dCxcbiAgICAgIHZhbHVlOiBpdGVtLnZhbHVlLFxuICAgICAgZGlzYWJsZWQ6IGl0ZW0uZGlzYWJsZWQsXG4gICAgICBjaGVja2VkOiBpdGVtLmNoZWNrZWQsXG4gICAgICBoaWRkZW46IGl0ZW0uaGlkZGVuLFxuICAgICAgY29sbGFwc2VkOiBpdGVtLmNvbGxhcHNlZCxcbiAgICAgIGNoaWxkcmVuOiBpdGVtLmNoaWxkcmVuXG4gICAgfSk7XG4gICAgdGhpcy5yZWZJdGVtID0gaXRlbTtcbiAgfVxuXG4gIHVwZGF0ZVJlZkNoZWNrZWQoKTogdm9pZCB7XG4gICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcbiAgICAgIGlmIChjaGlsZCBpbnN0YW5jZW9mIEZpbHRlclRyZWV2aWV3SXRlbSkge1xuICAgICAgICBjaGlsZC51cGRhdGVSZWZDaGVja2VkKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBsZXQgcmVmQ2hlY2tlZCA9IHRoaXMuY2hlY2tlZDtcbiAgICBpZiAocmVmQ2hlY2tlZCkge1xuICAgICAgZm9yIChjb25zdCByZWZDaGlsZCBvZiB0aGlzLnJlZkl0ZW0uY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKCFyZWZDaGlsZC5jaGVja2VkKSB7XG4gICAgICAgICAgcmVmQ2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMucmVmSXRlbS5jaGVja2VkID0gcmVmQ2hlY2tlZDtcbiAgfVxufVxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICduZ3gtdHJlZXZpZXcnLFxuICB0ZW1wbGF0ZVVybDogJy4vdHJlZXZpZXcuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi90cmVldmlldy5jb21wb25lbnQuc2NzcyddXG59KVxuZXhwb3J0IGNsYXNzIFRyZWV2aWV3Q29tcG9uZW50IGltcGxlbWVudHMgT25DaGFuZ2VzLCBPbkluaXQge1xuICBASW5wdXQoKSBoZWFkZXJUZW1wbGF0ZTogVGVtcGxhdGVSZWY8VHJlZXZpZXdIZWFkZXJUZW1wbGF0ZUNvbnRleHQ+O1xuICBASW5wdXQoKSBpdGVtVGVtcGxhdGU6IFRlbXBsYXRlUmVmPFRyZWV2aWV3SXRlbVRlbXBsYXRlQ29udGV4dD47XG4gIEBJbnB1dCgpIGl0ZW1zOiBUcmVldmlld0l0ZW1bXTtcbiAgQElucHV0KCkgY29uZmlnOiBUcmVldmlld0NvbmZpZztcbiAgQE91dHB1dCgpIHNlbGVjdGVkQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxhbnlbXT4oKTtcbiAgQE91dHB1dCgpIGZpbHRlckNoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8c3RyaW5nPigpO1xuICBoZWFkZXJUZW1wbGF0ZUNvbnRleHQ6IFRyZWV2aWV3SGVhZGVyVGVtcGxhdGVDb250ZXh0O1xuICBhbGxJdGVtOiBUcmVldmlld0l0ZW07XG4gIGZpbHRlclRleHQgPSAnJztcbiAgc2hvd0hpZGRlbiA9IGZhbHNlO1xuICBmaWx0ZXJJdGVtczogVHJlZXZpZXdJdGVtW107XG4gIHNlbGVjdGlvbjogVHJlZXZpZXdTZWxlY3Rpb247XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGkxOG46IFRyZWV2aWV3STE4bixcbiAgICBwcml2YXRlIGRlZmF1bHRDb25maWc6IFRyZWV2aWV3Q29uZmlnLFxuICAgIHByaXZhdGUgZXZlbnRQYXJzZXI6IFRyZWV2aWV3RXZlbnRQYXJzZXJcbiAgKSB7XG4gICAgdGhpcy5jb25maWcgPSB0aGlzLmRlZmF1bHRDb25maWc7XG4gICAgdGhpcy5hbGxJdGVtID0gbmV3IFRyZWV2aWV3SXRlbSh7IHRleHQ6ICdBbGwnLCB2YWx1ZTogdW5kZWZpbmVkIH0pO1xuICB9XG5cbiAgZ2V0IGhhc0ZpbHRlckl0ZW1zKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhaXNOaWwodGhpcy5maWx0ZXJJdGVtcykgJiYgdGhpcy5maWx0ZXJJdGVtcy5sZW5ndGggPiAwO1xuICB9XG5cbiAgZ2V0IG1heEhlaWdodCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHt0aGlzLmNvbmZpZy5tYXhIZWlnaHR9YDtcbiAgfVxuXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIHRoaXMuY3JlYXRlSGVhZGVyVGVtcGxhdGVDb250ZXh0KCk7XG4gICAgdGhpcy5nZW5lcmF0ZVNlbGVjdGlvbigpO1xuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IHZvaWQge1xuICAgIGNvbnN0IGl0ZW1zU2ltcGxlQ2hhbmdlID0gY2hhbmdlcy5pdGVtcztcbiAgICBpZiAoIWlzTmlsKGl0ZW1zU2ltcGxlQ2hhbmdlKSAmJiAhaXNOaWwodGhpcy5pdGVtcykpIHtcbiAgICAgIHRoaXMudXBkYXRlRmlsdGVySXRlbXMoKTtcbiAgICAgIHRoaXMudXBkYXRlQ29sbGFwc2VkT2ZBbGwoKTtcbiAgICAgIHRoaXMucmFpc2VTZWxlY3RlZENoYW5nZSgpO1xuICAgIH1cbiAgfVxuXG4gIG9uQWxsQ29sbGFwc2VFeHBhbmQoKTogdm9pZCB7XG4gICAgdGhpcy5hbGxJdGVtLmNvbGxhcHNlZCA9ICF0aGlzLmFsbEl0ZW0uY29sbGFwc2VkO1xuICAgIHRoaXMuZmlsdGVySXRlbXMuZm9yRWFjaChpdGVtID0+IGl0ZW0uc2V0Q29sbGFwc2VkUmVjdXJzaXZlKHRoaXMuYWxsSXRlbS5jb2xsYXBzZWQpKTtcbiAgfVxuXG4gIG9uRmlsdGVyVGV4dENoYW5nZSh0ZXh0OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmZpbHRlclRleHQgPSB0ZXh0O1xuICAgIHRoaXMuZmlsdGVyQ2hhbmdlLmVtaXQodGV4dCk7XG4gICAgdGhpcy51cGRhdGVGaWx0ZXJJdGVtcygpO1xuICB9XG5cbiAgb25GaWx0ZXJTaG93SGlkZGVuQ2hhbmdlKHNob3dIaWRkZW46IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLnNob3dIaWRkZW4gPSBzaG93SGlkZGVuO1xuICAgIHRoaXMuZmlsdGVyQ2hhbmdlLmVtaXQoYCR7c2hvd0hpZGRlbn1gKTtcbiAgICB0aGlzLmZpbHRlclRleHQgPSAnJztcbiAgICB0aGlzLnVwZGF0ZUZpbHRlckl0ZW1zKCk7XG4gIH1cblxuICBvbkFsbENoZWNrZWRDaGFuZ2UoKTogdm9pZCB7XG4gICAgY29uc3QgY2hlY2tlZCA9IHRoaXMuYWxsSXRlbS5jaGVja2VkO1xuICAgIHRoaXMuZmlsdGVySXRlbXMuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgIGl0ZW0uc2V0Q2hlY2tlZFJlY3Vyc2l2ZShjaGVja2VkKTtcbiAgICAgIGlmIChpdGVtIGluc3RhbmNlb2YgRmlsdGVyVHJlZXZpZXdJdGVtKSB7XG4gICAgICAgIGl0ZW0udXBkYXRlUmVmQ2hlY2tlZCgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5yYWlzZVNlbGVjdGVkQ2hhbmdlKCk7XG4gIH1cblxuICBvbkl0ZW1DaGVja2VkQ2hhbmdlKGl0ZW06IFRyZWV2aWV3SXRlbSwgY2hlY2tlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmIChpdGVtIGluc3RhbmNlb2YgRmlsdGVyVHJlZXZpZXdJdGVtKSB7XG4gICAgICBpdGVtLnVwZGF0ZVJlZkNoZWNrZWQoKTtcbiAgICB9XG5cbiAgICB0aGlzLnVwZGF0ZUNoZWNrZWRPZkFsbCgpO1xuICAgIHRoaXMucmFpc2VTZWxlY3RlZENoYW5nZSgpO1xuICB9XG5cbiAgcmFpc2VTZWxlY3RlZENoYW5nZSgpOiB2b2lkIHtcbiAgICB0aGlzLmdlbmVyYXRlU2VsZWN0aW9uKCk7XG4gICAgY29uc3QgdmFsdWVzID0gdGhpcy5ldmVudFBhcnNlci5nZXRTZWxlY3RlZENoYW5nZSh0aGlzKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuc2VsZWN0ZWRDaGFuZ2UuZW1pdCh2YWx1ZXMpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVIZWFkZXJUZW1wbGF0ZUNvbnRleHQoKTogdm9pZCB7XG4gICAgdGhpcy5oZWFkZXJUZW1wbGF0ZUNvbnRleHQgPSB7XG4gICAgICBjb25maWc6IHRoaXMuY29uZmlnLFxuICAgICAgaXRlbTogdGhpcy5hbGxJdGVtLFxuICAgICAgb25DaGVja2VkQ2hhbmdlOiAoKSA9PiB0aGlzLm9uQWxsQ2hlY2tlZENoYW5nZSgpLFxuICAgICAgb25Db2xsYXBzZUV4cGFuZDogKCkgPT4gdGhpcy5vbkFsbENvbGxhcHNlRXhwYW5kKCksXG4gICAgICBvbkZpbHRlclRleHRDaGFuZ2U6ICh0ZXh0KSA9PiB0aGlzLm9uRmlsdGVyVGV4dENoYW5nZSh0ZXh0KSxcbiAgICAgIG9uRmlsdGVyU2hvd0hpZGRlbkNoYW5nZTogKHNob3dIaWRkZW4pID0+IHRoaXMub25GaWx0ZXJTaG93SGlkZGVuQ2hhbmdlKHNob3dIaWRkZW4pXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgZ2VuZXJhdGVTZWxlY3Rpb24oKTogdm9pZCB7XG4gICAgbGV0IGNoZWNrZWRJdGVtczogVHJlZXZpZXdJdGVtW10gPSBbXTtcbiAgICBsZXQgdW5jaGVja2VkSXRlbXM6IFRyZWV2aWV3SXRlbVtdID0gW107XG4gICAgaWYgKCFpc05pbCh0aGlzLml0ZW1zKSkge1xuICAgICAgY29uc3Qgc2VsZWN0aW9uID0gVHJlZXZpZXdIZWxwZXIuY29uY2F0U2VsZWN0aW9uKHRoaXMuaXRlbXMsIGNoZWNrZWRJdGVtcywgdW5jaGVja2VkSXRlbXMpO1xuICAgICAgY2hlY2tlZEl0ZW1zID0gc2VsZWN0aW9uLmNoZWNrZWQ7XG4gICAgICB1bmNoZWNrZWRJdGVtcyA9IHNlbGVjdGlvbi51bmNoZWNrZWQ7XG4gICAgfVxuXG4gICAgdGhpcy5zZWxlY3Rpb24gPSB7XG4gICAgICBjaGVja2VkSXRlbXMsXG4gICAgICB1bmNoZWNrZWRJdGVtc1xuICAgIH07XG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZUZpbHRlckl0ZW1zKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmZpbHRlclRleHQgIT09ICcnKSB7XG4gICAgICBjb25zdCBmaWx0ZXJJdGVtczogVHJlZXZpZXdJdGVtW10gPSBbXTtcbiAgICAgIGNvbnN0IGZpbHRlclRleHQgPSB0aGlzLmZpbHRlclRleHQudG9Mb3dlckNhc2UoKTtcbiAgICAgIHRoaXMuaXRlbXMuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgY29uc3QgbmV3SXRlbSA9IHRoaXMuZmlsdGVySXRlbShpdGVtLCBmaWx0ZXJUZXh0KTtcbiAgICAgICAgaWYgKCFpc05pbChuZXdJdGVtKSkge1xuICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy5maWx0ZXJIaWRkZW4pIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlcmVkSGlkZGVuSXRlbSA9IHRoaXMuZmlsdGVySXRlbUhpZGRlbihuZXdJdGVtLCB0aGlzLnNob3dIaWRkZW4pO1xuXG4gICAgICAgICAgICBpZiAoIWlzTmlsKGZpbHRlcmVkSGlkZGVuSXRlbSkpIHtcbiAgICAgICAgICAgICAgZmlsdGVySXRlbXMucHVzaChmaWx0ZXJlZEhpZGRlbkl0ZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmaWx0ZXJJdGVtcy5wdXNoKG5ld0l0ZW0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0aGlzLmZpbHRlckl0ZW1zID0gZmlsdGVySXRlbXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGZpbHRlckl0ZW1zOiBUcmVldmlld0l0ZW1bXSA9IFtdO1xuICAgICAgdGhpcy5pdGVtcy5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICBjb25zdCBuZXdJdGVtID0gdGhpcy5maWx0ZXJJdGVtSGlkZGVuKGl0ZW0sIHRoaXMuc2hvd0hpZGRlbik7XG4gICAgICAgIGlmICghaXNOaWwobmV3SXRlbSkpIHtcbiAgICAgICAgICBmaWx0ZXJJdGVtcy5wdXNoKG5ld0l0ZW0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoaXMuZmlsdGVySXRlbXMgPSBmaWx0ZXJJdGVtcztcbiAgICB9XG5cbiAgICB0aGlzLnVwZGF0ZUNoZWNrZWRPZkFsbCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBmaWx0ZXJJdGVtSGlkZGVuKGl0ZW06IFRyZWV2aWV3SXRlbSwgc2hvd0hpZGRlbjogYm9vbGVhbikge1xuICAgIGlmICghc2hvd0hpZGRlbiAmJiB0aGlzLmNvbmZpZy5maWx0ZXJIaWRkZW4pIHtcbiAgICAgIGlmIChpdGVtLmhpZGRlbikge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCFpc05pbChpdGVtLmNoaWxkcmVuKSkge1xuICAgICAgICAgIGNvbnN0IGNoaWxkcmVuOiBUcmVldmlld0l0ZW1bXSA9IFtdO1xuICAgICAgICAgIGl0ZW0uY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdDaGlsZCA9IHRoaXMuZmlsdGVySXRlbUhpZGRlbihjaGlsZCwgc2hvd0hpZGRlbik7XG4gICAgICAgICAgICBpZiAoIWlzTmlsKG5ld0NoaWxkKSkge1xuICAgICAgICAgICAgICBjaGlsZHJlbi5wdXNoKG5ld0NoaWxkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3QgbmV3SXRlbSA9IG5ldyBGaWx0ZXJUcmVldmlld0l0ZW0oaXRlbSk7XG4gICAgICAgICAgICBuZXdJdGVtLmNvbGxhcHNlZCA9IGZhbHNlO1xuICAgICAgICAgICAgbmV3SXRlbS5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuICAgICAgICAgICAgcmV0dXJuIG5ld0l0ZW07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IG5ld0l0ZW0gPSBuZXcgRmlsdGVyVHJlZXZpZXdJdGVtKG5ldyBUcmVldmlld0l0ZW0oe1xuICAgICAgICAgICAgICB0ZXh0OiBpdGVtLnRleHQsXG4gICAgICAgICAgICAgIHZhbHVlOiBpdGVtLnZhbHVlLFxuICAgICAgICAgICAgICBkaXNhYmxlZDogaXRlbS5kaXNhYmxlZCxcbiAgICAgICAgICAgICAgY2hlY2tlZDogaXRlbS5jaGVja2VkLFxuICAgICAgICAgICAgICBoaWRkZW46IGl0ZW0uaGlkZGVuLFxuICAgICAgICAgICAgICBjb2xsYXBzZWQ6IGl0ZW0uY29sbGFwc2VkLFxuICAgICAgICAgICAgICBjaGlsZHJlbjogW11cbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIG5ld0l0ZW0uY29sbGFwc2VkID0gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm4gbmV3SXRlbTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGl0ZW07XG4gICAgfVxuXG4gICAgcmV0dXJuIGl0ZW07XG4gIH1cblxuICBwcml2YXRlIGZpbHRlckl0ZW0oaXRlbTogVHJlZXZpZXdJdGVtLCBmaWx0ZXJUZXh0OiBzdHJpbmcpOiBUcmVldmlld0l0ZW0ge1xuICAgIGNvbnN0IGlzTWF0Y2ggPSBpbmNsdWRlcyhpdGVtLnRleHQudG9Mb3dlckNhc2UoKSwgZmlsdGVyVGV4dCk7XG4gICAgaWYgKGlzTWF0Y2ggJiYgKHRoaXMuc2hvd0hpZGRlbiB8fCAoIXRoaXMuc2hvd0hpZGRlbiAmJiAhaXRlbS5oaWRkZW4pKSkge1xuICAgICAgcmV0dXJuIGl0ZW07XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghaXNOaWwoaXRlbS5jaGlsZHJlbikgJiYgKCghdGhpcy5zaG93SGlkZGVuICYmICFpdGVtLmhpZGRlbikgfHwgdGhpcy5zaG93SGlkZGVuKSkge1xuICAgICAgICBjb25zdCBjaGlsZHJlbjogVHJlZXZpZXdJdGVtW10gPSBbXTtcbiAgICAgICAgaXRlbS5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcbiAgICAgICAgICBjb25zdCBuZXdDaGlsZCA9IHRoaXMuZmlsdGVySXRlbShjaGlsZCwgZmlsdGVyVGV4dCk7XG4gICAgICAgICAgaWYgKCFpc05pbChuZXdDaGlsZCkpIHtcbiAgICAgICAgICAgIGNoaWxkcmVuLnB1c2gobmV3Q2hpbGQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgY29uc3QgbmV3SXRlbSA9IG5ldyBGaWx0ZXJUcmVldmlld0l0ZW0oaXRlbSk7XG4gICAgICAgICAgbmV3SXRlbS5jb2xsYXBzZWQgPSBmYWxzZTtcbiAgICAgICAgICBuZXdJdGVtLmNoaWxkcmVuID0gY2hpbGRyZW47XG4gICAgICAgICAgcmV0dXJuIG5ld0l0ZW07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVDaGVja2VkT2ZBbGwoKTogdm9pZCB7XG4gICAgbGV0IGl0ZW1DaGVja2VkOiBib29sZWFuID0gbnVsbDtcbiAgICBmb3IgKGNvbnN0IGZpbHRlckl0ZW0gb2YgdGhpcy5maWx0ZXJJdGVtcykge1xuICAgICAgaWYgKGl0ZW1DaGVja2VkID09PSBudWxsKSB7XG4gICAgICAgIGl0ZW1DaGVja2VkID0gZmlsdGVySXRlbS5jaGVja2VkO1xuICAgICAgfSBlbHNlIGlmIChpdGVtQ2hlY2tlZCAhPT0gZmlsdGVySXRlbS5jaGVja2VkKSB7XG4gICAgICAgIGl0ZW1DaGVja2VkID0gdW5kZWZpbmVkO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaXRlbUNoZWNrZWQgPT09IG51bGwpIHtcbiAgICAgIGl0ZW1DaGVja2VkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy5hbGxJdGVtLmNoZWNrZWQgPSBpdGVtQ2hlY2tlZDtcbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlQ29sbGFwc2VkT2ZBbGwoKTogdm9pZCB7XG4gICAgbGV0IGhhc0l0ZW1FeHBhbmRlZCA9IGZhbHNlO1xuICAgIGZvciAoY29uc3QgZmlsdGVySXRlbSBvZiB0aGlzLmZpbHRlckl0ZW1zKSB7XG4gICAgICBpZiAoIWZpbHRlckl0ZW0uY29sbGFwc2VkKSB7XG4gICAgICAgIGhhc0l0ZW1FeHBhbmRlZCA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuYWxsSXRlbS5jb2xsYXBzZWQgPSAhaGFzSXRlbUV4cGFuZGVkO1xuICB9XG59XG4iXX0=