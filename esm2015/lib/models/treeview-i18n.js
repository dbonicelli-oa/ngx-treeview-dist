import { Injectable } from '@angular/core';
export class TreeviewI18n {
}
TreeviewI18n.decorators = [
    { type: Injectable }
];
export class DefaultTreeviewI18n extends TreeviewI18n {
    getText(selection) {
        if (selection.uncheckedItems.length === 0) {
            if (selection.checkedItems.length > 0) {
                return this.getAllCheckboxText();
            }
            else {
                return '';
            }
        }
        switch (selection.checkedItems.length) {
            case 0:
                return 'Select options';
            case 1:
                return selection.checkedItems[0].text;
            default:
                return `${selection.checkedItems.length} options selected`;
        }
    }
    getAllCheckboxText() {
        return 'All';
    }
    getFilterPlaceholder() {
        return 'Filter';
    }
    getFilterNoItemsFoundText() {
        return 'No items found';
    }
    getTooltipCollapseExpandText(isCollapse) {
        return isCollapse ? 'Expand' : 'Collapse';
    }
}
DefaultTreeviewI18n.decorators = [
    { type: Injectable }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZXZpZXctaTE4bi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL25neC10cmVldmlldy9zcmMvbGliL21vZGVscy90cmVldmlldy1pMThuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFJM0MsTUFBTSxPQUFnQixZQUFZOzs7WUFEakMsVUFBVTs7QUFVWCxNQUFNLE9BQU8sbUJBQW9CLFNBQVEsWUFBWTtJQUNuRCxPQUFPLENBQUMsU0FBNEI7UUFDbEMsSUFBSSxTQUFTLENBQUMsY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDekMsSUFBSSxTQUFTLENBQUMsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3JDLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7YUFDbEM7aUJBQU07Z0JBQ0wsT0FBTyxFQUFFLENBQUM7YUFDWDtTQUNGO1FBRUQsUUFBUSxTQUFTLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRTtZQUNyQyxLQUFLLENBQUM7Z0JBQ0osT0FBTyxnQkFBZ0IsQ0FBQztZQUMxQixLQUFLLENBQUM7Z0JBQ0osT0FBTyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUN4QztnQkFDRSxPQUFPLEdBQUcsU0FBUyxDQUFDLFlBQVksQ0FBQyxNQUFNLG1CQUFtQixDQUFDO1NBQzlEO0lBQ0gsQ0FBQztJQUVELGtCQUFrQjtRQUNoQixPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCxvQkFBb0I7UUFDbEIsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQztJQUVELHlCQUF5QjtRQUN2QixPQUFPLGdCQUFnQixDQUFDO0lBQzFCLENBQUM7SUFFRCw0QkFBNEIsQ0FBQyxVQUFtQjtRQUM5QyxPQUFPLFVBQVUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7SUFDNUMsQ0FBQzs7O1lBbkNGLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBUcmVldmlld1NlbGVjdGlvbiB9IGZyb20gJy4vdHJlZXZpZXctaXRlbSc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBUcmVldmlld0kxOG4ge1xuICBhYnN0cmFjdCBnZXRUZXh0KHNlbGVjdGlvbjogVHJlZXZpZXdTZWxlY3Rpb24pOiBzdHJpbmc7XG4gIGFic3RyYWN0IGdldEFsbENoZWNrYm94VGV4dCgpOiBzdHJpbmc7XG4gIGFic3RyYWN0IGdldEZpbHRlclBsYWNlaG9sZGVyKCk6IHN0cmluZztcbiAgYWJzdHJhY3QgZ2V0RmlsdGVyTm9JdGVtc0ZvdW5kVGV4dCgpOiBzdHJpbmc7XG4gIGFic3RyYWN0IGdldFRvb2x0aXBDb2xsYXBzZUV4cGFuZFRleHQoaXNDb2xsYXBzZTogYm9vbGVhbik6IHN0cmluZztcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIERlZmF1bHRUcmVldmlld0kxOG4gZXh0ZW5kcyBUcmVldmlld0kxOG4ge1xuICBnZXRUZXh0KHNlbGVjdGlvbjogVHJlZXZpZXdTZWxlY3Rpb24pOiBzdHJpbmcge1xuICAgIGlmIChzZWxlY3Rpb24udW5jaGVja2VkSXRlbXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBpZiAoc2VsZWN0aW9uLmNoZWNrZWRJdGVtcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEFsbENoZWNrYm94VGV4dCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN3aXRjaCAoc2VsZWN0aW9uLmNoZWNrZWRJdGVtcy5sZW5ndGgpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgcmV0dXJuICdTZWxlY3Qgb3B0aW9ucyc7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIHJldHVybiBzZWxlY3Rpb24uY2hlY2tlZEl0ZW1zWzBdLnRleHQ7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gYCR7c2VsZWN0aW9uLmNoZWNrZWRJdGVtcy5sZW5ndGh9IG9wdGlvbnMgc2VsZWN0ZWRgO1xuICAgIH1cbiAgfVxuXG4gIGdldEFsbENoZWNrYm94VGV4dCgpOiBzdHJpbmcge1xuICAgIHJldHVybiAnQWxsJztcbiAgfVxuXG4gIGdldEZpbHRlclBsYWNlaG9sZGVyKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdGaWx0ZXInO1xuICB9XG5cbiAgZ2V0RmlsdGVyTm9JdGVtc0ZvdW5kVGV4dCgpOiBzdHJpbmcge1xuICAgIHJldHVybiAnTm8gaXRlbXMgZm91bmQnO1xuICB9XG5cbiAgZ2V0VG9vbHRpcENvbGxhcHNlRXhwYW5kVGV4dChpc0NvbGxhcHNlOiBib29sZWFuKTogc3RyaW5nIHtcbiAgICByZXR1cm4gaXNDb2xsYXBzZSA/ICdFeHBhbmQnIDogJ0NvbGxhcHNlJztcbiAgfVxufVxuIl19