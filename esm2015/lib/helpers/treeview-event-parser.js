import { Injectable } from '@angular/core';
import { isNil } from 'lodash';
export class TreeviewEventParser {
}
TreeviewEventParser.decorators = [
    { type: Injectable }
];
export class DefaultTreeviewEventParser extends TreeviewEventParser {
    getSelectedChange(component) {
        const checkedItems = component.selection.checkedItems;
        if (!isNil(checkedItems)) {
            return checkedItems.map(item => item.value);
        }
        return [];
    }
}
DefaultTreeviewEventParser.decorators = [
    { type: Injectable }
];
export class DownlineTreeviewEventParser extends TreeviewEventParser {
    getSelectedChange(component) {
        const items = component.items;
        if (!isNil(items)) {
            let result = [];
            items.forEach(item => {
                const links = this.getLinks(item, null);
                if (!isNil(links)) {
                    result = result.concat(links);
                }
            });
            return result;
        }
        return [];
    }
    getLinks(item, parent) {
        if (!isNil(item.children)) {
            const link = {
                item,
                parent
            };
            let result = [];
            item.children.forEach(child => {
                const links = this.getLinks(child, link);
                if (!isNil(links)) {
                    result = result.concat(links);
                }
            });
            return result;
        }
        if (item.checked) {
            return [{
                    item,
                    parent
                }];
        }
        return null;
    }
}
DownlineTreeviewEventParser.decorators = [
    { type: Injectable }
];
export class OrderDownlineTreeviewEventParser extends TreeviewEventParser {
    constructor() {
        super(...arguments);
        this.currentDownlines = [];
        this.parser = new DownlineTreeviewEventParser();
    }
    getSelectedChange(component) {
        const newDownlines = this.parser.getSelectedChange(component);
        if (this.currentDownlines.length === 0) {
            this.currentDownlines = newDownlines;
        }
        else {
            const intersectDownlines = [];
            this.currentDownlines.forEach(downline => {
                let foundIndex = -1;
                const length = newDownlines.length;
                for (let i = 0; i < length; i++) {
                    if (downline.item.value === newDownlines[i].item.value) {
                        foundIndex = i;
                        break;
                    }
                }
                if (foundIndex !== -1) {
                    intersectDownlines.push(newDownlines[foundIndex]);
                    newDownlines.splice(foundIndex, 1);
                }
            });
            this.currentDownlines = intersectDownlines.concat(newDownlines);
        }
        return this.currentDownlines;
    }
}
OrderDownlineTreeviewEventParser.decorators = [
    { type: Injectable }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZXZpZXctZXZlbnQtcGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LXRyZWV2aWV3L3NyYy9saWIvaGVscGVycy90cmVldmlldy1ldmVudC1wYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBSy9CLE1BQU0sT0FBZ0IsbUJBQW1COzs7WUFEeEMsVUFBVTs7QUFNWCxNQUFNLE9BQU8sMEJBQTJCLFNBQVEsbUJBQW1CO0lBQ2pFLGlCQUFpQixDQUFDLFNBQTRCO1FBQzVDLE1BQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDO1FBQ3RELElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDeEIsT0FBTyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQzdDO1FBRUQsT0FBTyxFQUFFLENBQUM7SUFDWixDQUFDOzs7WUFURixVQUFVOztBQWtCWCxNQUFNLE9BQU8sMkJBQTRCLFNBQVEsbUJBQW1CO0lBQ2xFLGlCQUFpQixDQUFDLFNBQTRCO1FBQzVDLE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUM7UUFDOUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNqQixJQUFJLE1BQU0sR0FBMkIsRUFBRSxDQUFDO1lBQ3hDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ25CLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUN4QyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUNqQixNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDL0I7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sTUFBTSxDQUFDO1NBQ2Y7UUFFRCxPQUFPLEVBQUUsQ0FBQztJQUNaLENBQUM7SUFFTyxRQUFRLENBQUMsSUFBa0IsRUFBRSxNQUE0QjtRQUMvRCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUN6QixNQUFNLElBQUksR0FBRztnQkFDWCxJQUFJO2dCQUNKLE1BQU07YUFDUCxDQUFDO1lBQ0YsSUFBSSxNQUFNLEdBQTJCLEVBQUUsQ0FBQztZQUN4QyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDNUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3pDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQ2pCLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUMvQjtZQUNILENBQUMsQ0FBQyxDQUFDO1lBRUgsT0FBTyxNQUFNLENBQUM7U0FDZjtRQUVELElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNoQixPQUFPLENBQUM7b0JBQ04sSUFBSTtvQkFDSixNQUFNO2lCQUNQLENBQUMsQ0FBQztTQUNKO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDOzs7WUE1Q0YsVUFBVTs7QUFnRFgsTUFBTSxPQUFPLGdDQUFpQyxTQUFRLG1CQUFtQjtJQUR6RTs7UUFFVSxxQkFBZ0IsR0FBMkIsRUFBRSxDQUFDO1FBQzlDLFdBQU0sR0FBRyxJQUFJLDJCQUEyQixFQUFFLENBQUM7SUE2QnJELENBQUM7SUEzQkMsaUJBQWlCLENBQUMsU0FBNEI7UUFDNUMsTUFBTSxZQUFZLEdBQTJCLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdEYsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN0QyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsWUFBWSxDQUFDO1NBQ3RDO2FBQU07WUFDTCxNQUFNLGtCQUFrQixHQUEyQixFQUFFLENBQUM7WUFDdEQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDdkMsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLE1BQU0sTUFBTSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUM7Z0JBQ25DLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQy9CLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7d0JBQ3RELFVBQVUsR0FBRyxDQUFDLENBQUM7d0JBQ2YsTUFBTTtxQkFDUDtpQkFDRjtnQkFFRCxJQUFJLFVBQVUsS0FBSyxDQUFDLENBQUMsRUFBRTtvQkFDckIsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO29CQUNsRCxZQUFZLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDcEM7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDakU7UUFFRCxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztJQUMvQixDQUFDOzs7WUEvQkYsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IGlzTmlsIH0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IFRyZWV2aWV3SXRlbSB9IGZyb20gJy4uL21vZGVscy90cmVldmlldy1pdGVtJztcbmltcG9ydCB7IFRyZWV2aWV3Q29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50cy90cmVldmlldy90cmVldmlldy5jb21wb25lbnQnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVHJlZXZpZXdFdmVudFBhcnNlciB7XG4gIGFic3RyYWN0IGdldFNlbGVjdGVkQ2hhbmdlKGNvbXBvbmVudDogVHJlZXZpZXdDb21wb25lbnQpOiBhbnlbXTtcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIERlZmF1bHRUcmVldmlld0V2ZW50UGFyc2VyIGV4dGVuZHMgVHJlZXZpZXdFdmVudFBhcnNlciB7XG4gIGdldFNlbGVjdGVkQ2hhbmdlKGNvbXBvbmVudDogVHJlZXZpZXdDb21wb25lbnQpOiBhbnlbXSB7XG4gICAgY29uc3QgY2hlY2tlZEl0ZW1zID0gY29tcG9uZW50LnNlbGVjdGlvbi5jaGVja2VkSXRlbXM7XG4gICAgaWYgKCFpc05pbChjaGVja2VkSXRlbXMpKSB7XG4gICAgICByZXR1cm4gY2hlY2tlZEl0ZW1zLm1hcChpdGVtID0+IGl0ZW0udmFsdWUpO1xuICAgIH1cblxuICAgIHJldHVybiBbXTtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIERvd25saW5lVHJlZXZpZXdJdGVtIHtcbiAgaXRlbTogVHJlZXZpZXdJdGVtO1xuICBwYXJlbnQ6IERvd25saW5lVHJlZXZpZXdJdGVtO1xufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRG93bmxpbmVUcmVldmlld0V2ZW50UGFyc2VyIGV4dGVuZHMgVHJlZXZpZXdFdmVudFBhcnNlciB7XG4gIGdldFNlbGVjdGVkQ2hhbmdlKGNvbXBvbmVudDogVHJlZXZpZXdDb21wb25lbnQpOiBhbnlbXSB7XG4gICAgY29uc3QgaXRlbXMgPSBjb21wb25lbnQuaXRlbXM7XG4gICAgaWYgKCFpc05pbChpdGVtcykpIHtcbiAgICAgIGxldCByZXN1bHQ6IERvd25saW5lVHJlZXZpZXdJdGVtW10gPSBbXTtcbiAgICAgIGl0ZW1zLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgIGNvbnN0IGxpbmtzID0gdGhpcy5nZXRMaW5rcyhpdGVtLCBudWxsKTtcbiAgICAgICAgaWYgKCFpc05pbChsaW5rcykpIHtcbiAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KGxpbmtzKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRMaW5rcyhpdGVtOiBUcmVldmlld0l0ZW0sIHBhcmVudDogRG93bmxpbmVUcmVldmlld0l0ZW0pOiBEb3dubGluZVRyZWV2aWV3SXRlbVtdIHtcbiAgICBpZiAoIWlzTmlsKGl0ZW0uY2hpbGRyZW4pKSB7XG4gICAgICBjb25zdCBsaW5rID0ge1xuICAgICAgICBpdGVtLFxuICAgICAgICBwYXJlbnRcbiAgICAgIH07XG4gICAgICBsZXQgcmVzdWx0OiBEb3dubGluZVRyZWV2aWV3SXRlbVtdID0gW107XG4gICAgICBpdGVtLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xuICAgICAgICBjb25zdCBsaW5rcyA9IHRoaXMuZ2V0TGlua3MoY2hpbGQsIGxpbmspO1xuICAgICAgICBpZiAoIWlzTmlsKGxpbmtzKSkge1xuICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQobGlua3MpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBpZiAoaXRlbS5jaGVja2VkKSB7XG4gICAgICByZXR1cm4gW3tcbiAgICAgICAgaXRlbSxcbiAgICAgICAgcGFyZW50XG4gICAgICB9XTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgT3JkZXJEb3dubGluZVRyZWV2aWV3RXZlbnRQYXJzZXIgZXh0ZW5kcyBUcmVldmlld0V2ZW50UGFyc2VyIHtcbiAgcHJpdmF0ZSBjdXJyZW50RG93bmxpbmVzOiBEb3dubGluZVRyZWV2aWV3SXRlbVtdID0gW107XG4gIHByaXZhdGUgcGFyc2VyID0gbmV3IERvd25saW5lVHJlZXZpZXdFdmVudFBhcnNlcigpO1xuXG4gIGdldFNlbGVjdGVkQ2hhbmdlKGNvbXBvbmVudDogVHJlZXZpZXdDb21wb25lbnQpOiBhbnlbXSB7XG4gICAgY29uc3QgbmV3RG93bmxpbmVzOiBEb3dubGluZVRyZWV2aWV3SXRlbVtdID0gdGhpcy5wYXJzZXIuZ2V0U2VsZWN0ZWRDaGFuZ2UoY29tcG9uZW50KTtcbiAgICBpZiAodGhpcy5jdXJyZW50RG93bmxpbmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5jdXJyZW50RG93bmxpbmVzID0gbmV3RG93bmxpbmVzO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBpbnRlcnNlY3REb3dubGluZXM6IERvd25saW5lVHJlZXZpZXdJdGVtW10gPSBbXTtcbiAgICAgIHRoaXMuY3VycmVudERvd25saW5lcy5mb3JFYWNoKGRvd25saW5lID0+IHtcbiAgICAgICAgbGV0IGZvdW5kSW5kZXggPSAtMTtcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gbmV3RG93bmxpbmVzLmxlbmd0aDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChkb3dubGluZS5pdGVtLnZhbHVlID09PSBuZXdEb3dubGluZXNbaV0uaXRlbS52YWx1ZSkge1xuICAgICAgICAgICAgZm91bmRJbmRleCA9IGk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZm91bmRJbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICBpbnRlcnNlY3REb3dubGluZXMucHVzaChuZXdEb3dubGluZXNbZm91bmRJbmRleF0pO1xuICAgICAgICAgIG5ld0Rvd25saW5lcy5zcGxpY2UoZm91bmRJbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmN1cnJlbnREb3dubGluZXMgPSBpbnRlcnNlY3REb3dubGluZXMuY29uY2F0KG5ld0Rvd25saW5lcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuY3VycmVudERvd25saW5lcztcbiAgfVxufVxuIl19