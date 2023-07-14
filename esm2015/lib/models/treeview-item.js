import { isBoolean, isNil, isString } from 'lodash';
import { TreeviewHelper } from '../helpers/treeview-helper';
export class TreeviewItem {
    constructor(item, autoCorrectChecked = false) {
        this.internalDisabled = false;
        this.internalChecked = true;
        this.internalCollapsed = false;
        this.internalHidden = false;
        if (isNil(item)) {
            throw new Error('Item must be defined');
        }
        if (isString(item.text)) {
            this.text = item.text;
        }
        else {
            throw new Error('A text of item must be string object');
        }
        this.value = item.value;
        if (isBoolean(item.checked)) {
            this.checked = item.checked;
        }
        if (isBoolean(item.collapsed)) {
            this.collapsed = item.collapsed;
        }
        if (isBoolean(item.disabled)) {
            this.disabled = item.disabled;
        }
        if (isBoolean(item.hidden)) {
            this.hidden = item.hidden;
        }
        if (!isNil(item.children) && item.children.length > 0) {
            this.children = item.children.map(child => {
                if (this.disabled === true) {
                    child.disabled = true;
                }
                return new TreeviewItem(child);
            });
        }
        if (autoCorrectChecked) {
            this.correctChecked();
        }
    }
    get checked() {
        return this.internalChecked;
    }
    set checked(value) {
        if (!this.internalDisabled) {
            if (this.internalChecked !== value) {
                this.internalChecked = value;
            }
        }
    }
    get hidden() {
        return this.internalHidden;
    }
    set hidden(value) {
        if (!this.internalHidden) {
            if (this.internalHidden !== value) {
                this.internalHidden = value;
            }
        }
    }
    get indeterminate() {
        return this.checked === undefined;
    }
    setCheckedRecursive(value) {
        if (!this.internalDisabled) {
            this.internalChecked = value;
            if (!isNil(this.internalChildren)) {
                this.internalChildren.forEach(child => child.setCheckedRecursive(value));
            }
        }
    }
    get disabled() {
        return this.internalDisabled;
    }
    set disabled(value) {
        if (this.internalDisabled !== value) {
            this.internalDisabled = value;
            if (!isNil(this.internalChildren)) {
                this.internalChildren.forEach(child => child.disabled = value);
            }
        }
    }
    get collapsed() {
        return this.internalCollapsed;
    }
    set collapsed(value) {
        if (this.internalCollapsed !== value) {
            this.internalCollapsed = value;
        }
    }
    setCollapsedRecursive(value) {
        this.internalCollapsed = value;
        if (!isNil(this.internalChildren)) {
            this.internalChildren.forEach(child => child.setCollapsedRecursive(value));
        }
    }
    get children() {
        return this.internalChildren;
    }
    set children(value) {
        if (this.internalChildren !== value) {
            if (!isNil(value) && value.length === 0) {
                throw new Error('Children must be not an empty array');
            }
            this.internalChildren = value;
            if (!isNil(this.internalChildren)) {
                let checked = null;
                this.internalChildren.forEach(child => {
                    if (checked === null) {
                        checked = child.checked;
                    }
                    else {
                        if (child.checked !== checked) {
                            checked = undefined;
                            return;
                        }
                    }
                });
                this.internalChecked = checked;
            }
        }
    }
    getSelection() {
        let checkedItems = [];
        let uncheckedItems = [];
        if (isNil(this.internalChildren)) {
            if (this.internalChecked) {
                checkedItems.push(this);
            }
            else {
                uncheckedItems.push(this);
            }
        }
        else {
            const selection = TreeviewHelper.concatSelection(this.internalChildren, checkedItems, uncheckedItems);
            checkedItems = selection.checked;
            uncheckedItems = selection.unchecked;
        }
        return {
            checkedItems,
            uncheckedItems
        };
    }
    correctChecked() {
        this.internalChecked = this.getCorrectChecked();
    }
    getCorrectChecked() {
        let checked = null;
        if (!isNil(this.internalChildren)) {
            for (const child of this.internalChildren) {
                child.internalChecked = child.getCorrectChecked();
                if (checked === null) {
                    checked = child.internalChecked;
                }
                else if (checked !== child.internalChecked) {
                    checked = undefined;
                    break;
                }
            }
        }
        else {
            checked = this.checked;
        }
        return checked;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZXZpZXctaXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL25neC10cmVldmlldy9zcmMvbGliL21vZGVscy90cmVldmlldy1pdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUNwRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFpQjVELE1BQU0sT0FBTyxZQUFZO0lBU3ZCLFlBQVksSUFBYyxFQUFFLGtCQUFrQixHQUFHLEtBQUs7UUFSOUMscUJBQWdCLEdBQUcsS0FBSyxDQUFDO1FBQ3pCLG9CQUFlLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLHNCQUFpQixHQUFHLEtBQUssQ0FBQztRQUMxQixtQkFBYyxHQUFHLEtBQUssQ0FBQztRQU03QixJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNmLE1BQU0sSUFBSSxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztTQUN6QztRQUNELElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN2QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7U0FDdkI7YUFBTTtZQUNMLE1BQU0sSUFBSSxLQUFLLENBQUMsc0NBQXNDLENBQUMsQ0FBQztTQUN6RDtRQUNELElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN4QixJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDM0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1NBQzdCO1FBQ0QsSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzdCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FB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QUFNLElBQUksT0FBTyxLQUFLLEtBQUssQ0FBQyxlQUFlLEVBQUU7b0JBQzVDLE9BQU8sR0FBRyxTQUFTLENBQUM7b0JBQ3BCLE1BQU07aUJBQ1A7YUFDRjtTQUNGO2FBQU07WUFDTCxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztTQUN4QjtRQUVELE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGlzQm9vbGVhbiwgaXNOaWwsIGlzU3RyaW5nIH0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IFRyZWV2aWV3SGVscGVyIH0gZnJvbSAnLi4vaGVscGVycy90cmVldmlldy1oZWxwZXInO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRyZWV2aWV3U2VsZWN0aW9uIHtcbiAgY2hlY2tlZEl0ZW1zOiBUcmVldmlld0l0ZW1bXTtcbiAgdW5jaGVja2VkSXRlbXM6IFRyZWV2aWV3SXRlbVtdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFRyZWVJdGVtIHtcbiAgdGV4dDogc3RyaW5nO1xuICB2YWx1ZTogYW55O1xuICBkaXNhYmxlZD86IGJvb2xlYW47XG4gIGhpZGRlbj86IGJvb2xlYW47XG4gIGNoZWNrZWQ/OiBib29sZWFuO1xuICBjb2xsYXBzZWQ/OiBib29sZWFuO1xuICBjaGlsZHJlbj86IFRyZWVJdGVtW107XG59XG5cbmV4cG9ydCBjbGFzcyBUcmVldmlld0l0ZW0ge1xuICBwcml2YXRlIGludGVybmFsRGlzYWJsZWQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBpbnRlcm5hbENoZWNrZWQgPSB0cnVlO1xuICBwcml2YXRlIGludGVybmFsQ29sbGFwc2VkID0gZmFsc2U7XG4gIHByaXZhdGUgaW50ZXJuYWxIaWRkZW4gPSBmYWxzZTtcbiAgcHJpdmF0ZSBpbnRlcm5hbENoaWxkcmVuOiBUcmVldmlld0l0ZW1bXTtcbiAgdGV4dDogc3RyaW5nO1xuICB2YWx1ZTogYW55O1xuXG4gIGNvbnN0cnVjdG9yKGl0ZW06IFRyZWVJdGVtLCBhdXRvQ29ycmVjdENoZWNrZWQgPSBmYWxzZSkge1xuICAgIGlmIChpc05pbChpdGVtKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJdGVtIG11c3QgYmUgZGVmaW5lZCcpO1xuICAgIH1cbiAgICBpZiAoaXNTdHJpbmcoaXRlbS50ZXh0KSkge1xuICAgICAgdGhpcy50ZXh0ID0gaXRlbS50ZXh0O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0EgdGV4dCBvZiBpdGVtIG11c3QgYmUgc3RyaW5nIG9iamVjdCcpO1xuICAgIH1cbiAgICB0aGlzLnZhbHVlID0gaXRlbS52YWx1ZTtcbiAgICBpZiAoaXNCb29sZWFuKGl0ZW0uY2hlY2tlZCkpIHtcbiAgICAgIHRoaXMuY2hlY2tlZCA9IGl0ZW0uY2hlY2tlZDtcbiAgICB9XG4gICAgaWYgKGlzQm9vbGVhbihpdGVtLmNvbGxhcHNlZCkpIHtcbiAgICAgIHRoaXMuY29sbGFwc2VkID0gaXRlbS5jb2xsYXBzZWQ7XG4gICAgfVxuICAgIGlmIChpc0Jvb2xlYW4oaXRlbS5kaXNhYmxlZCkpIHtcbiAgICAgIHRoaXMuZGlzYWJsZWQgPSBpdGVtLmRpc2FibGVkO1xuICAgIH1cbiAgICBpZiAoaXNCb29sZWFuKGl0ZW0uaGlkZGVuKSkge1xuICAgICAgdGhpcy5oaWRkZW4gPSBpdGVtLmhpZGRlbjtcbiAgICB9XG4gICAgaWYgKCFpc05pbChpdGVtLmNoaWxkcmVuKSAmJiBpdGVtLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuY2hpbGRyZW4gPSBpdGVtLmNoaWxkcmVuLm1hcChjaGlsZCA9PiB7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkID09PSB0cnVlKSB7XG4gICAgICAgICAgY2hpbGQuZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBUcmVldmlld0l0ZW0oY2hpbGQpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKGF1dG9Db3JyZWN0Q2hlY2tlZCkge1xuICAgICAgdGhpcy5jb3JyZWN0Q2hlY2tlZCgpO1xuICAgIH1cbiAgfVxuXG4gIGdldCBjaGVja2VkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsQ2hlY2tlZDtcbiAgfVxuXG4gIHNldCBjaGVja2VkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgaWYgKCF0aGlzLmludGVybmFsRGlzYWJsZWQpIHtcbiAgICAgIGlmICh0aGlzLmludGVybmFsQ2hlY2tlZCAhPT0gdmFsdWUpIHtcbiAgICAgICAgdGhpcy5pbnRlcm5hbENoZWNrZWQgPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXQgaGlkZGVuKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsSGlkZGVuO1xuICB9XG5cbiAgc2V0IGhpZGRlbih2YWx1ZTogYm9vbGVhbikge1xuICAgIGlmICghdGhpcy5pbnRlcm5hbEhpZGRlbikge1xuICAgICAgaWYgKHRoaXMuaW50ZXJuYWxIaWRkZW4gIT09IHZhbHVlKSB7XG4gICAgICAgIHRoaXMuaW50ZXJuYWxIaWRkZW4gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXQgaW5kZXRlcm1pbmF0ZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jaGVja2VkID09PSB1bmRlZmluZWQ7XG4gIH1cblxuICBzZXRDaGVja2VkUmVjdXJzaXZlKHZhbHVlOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmludGVybmFsRGlzYWJsZWQpIHtcbiAgICAgIHRoaXMuaW50ZXJuYWxDaGVja2VkID0gdmFsdWU7XG4gICAgICBpZiAoIWlzTmlsKHRoaXMuaW50ZXJuYWxDaGlsZHJlbikpIHtcbiAgICAgICAgdGhpcy5pbnRlcm5hbENoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4gY2hpbGQuc2V0Q2hlY2tlZFJlY3Vyc2l2ZSh2YWx1ZSkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldCBkaXNhYmxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbERpc2FibGVkO1xuICB9XG5cbiAgc2V0IGRpc2FibGVkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgaWYgKHRoaXMuaW50ZXJuYWxEaXNhYmxlZCAhPT0gdmFsdWUpIHtcbiAgICAgIHRoaXMuaW50ZXJuYWxEaXNhYmxlZCA9IHZhbHVlO1xuICAgICAgaWYgKCFpc05pbCh0aGlzLmludGVybmFsQ2hpbGRyZW4pKSB7XG4gICAgICAgIHRoaXMuaW50ZXJuYWxDaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IGNoaWxkLmRpc2FibGVkID0gdmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldCBjb2xsYXBzZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxDb2xsYXBzZWQ7XG4gIH1cblxuICBzZXQgY29sbGFwc2VkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgaWYgKHRoaXMuaW50ZXJuYWxDb2xsYXBzZWQgIT09IHZhbHVlKSB7XG4gICAgICB0aGlzLmludGVybmFsQ29sbGFwc2VkID0gdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgc2V0Q29sbGFwc2VkUmVjdXJzaXZlKHZhbHVlOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5pbnRlcm5hbENvbGxhcHNlZCA9IHZhbHVlO1xuICAgIGlmICghaXNOaWwodGhpcy5pbnRlcm5hbENoaWxkcmVuKSkge1xuICAgICAgdGhpcy5pbnRlcm5hbENoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4gY2hpbGQuc2V0Q29sbGFwc2VkUmVjdXJzaXZlKHZhbHVlKSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0IGNoaWxkcmVuKCk6IFRyZWV2aWV3SXRlbVtdIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbENoaWxkcmVuO1xuICB9XG5cbiAgc2V0IGNoaWxkcmVuKHZhbHVlOiBUcmVldmlld0l0ZW1bXSkge1xuICAgIGlmICh0aGlzLmludGVybmFsQ2hpbGRyZW4gIT09IHZhbHVlKSB7XG4gICAgICBpZiAoIWlzTmlsKHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDaGlsZHJlbiBtdXN0IGJlIG5vdCBhbiBlbXB0eSBhcnJheScpO1xuICAgICAgfVxuICAgICAgdGhpcy5pbnRlcm5hbENoaWxkcmVuID0gdmFsdWU7XG4gICAgICBpZiAoIWlzTmlsKHRoaXMuaW50ZXJuYWxDaGlsZHJlbikpIHtcbiAgICAgICAgbGV0IGNoZWNrZWQgPSBudWxsO1xuICAgICAgICB0aGlzLmludGVybmFsQ2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XG4gICAgICAgICAgaWYgKGNoZWNrZWQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGNoZWNrZWQgPSBjaGlsZC5jaGVja2VkO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoY2hpbGQuY2hlY2tlZCAhPT0gY2hlY2tlZCkge1xuICAgICAgICAgICAgICBjaGVja2VkID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5pbnRlcm5hbENoZWNrZWQgPSBjaGVja2VkO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldFNlbGVjdGlvbigpOiBUcmVldmlld1NlbGVjdGlvbiB7XG4gICAgbGV0IGNoZWNrZWRJdGVtczogVHJlZXZpZXdJdGVtW10gPSBbXTtcbiAgICBsZXQgdW5jaGVja2VkSXRlbXM6IFRyZWV2aWV3SXRlbVtdID0gW107XG4gICAgaWYgKGlzTmlsKHRoaXMuaW50ZXJuYWxDaGlsZHJlbikpIHtcbiAgICAgIGlmICh0aGlzLmludGVybmFsQ2hlY2tlZCkge1xuICAgICAgICBjaGVja2VkSXRlbXMucHVzaCh0aGlzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHVuY2hlY2tlZEl0ZW1zLnB1c2godGhpcyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHNlbGVjdGlvbiA9IFRyZWV2aWV3SGVscGVyLmNvbmNhdFNlbGVjdGlvbih0aGlzLmludGVybmFsQ2hpbGRyZW4sIGNoZWNrZWRJdGVtcywgdW5jaGVja2VkSXRlbXMpO1xuICAgICAgY2hlY2tlZEl0ZW1zID0gc2VsZWN0aW9uLmNoZWNrZWQ7XG4gICAgICB1bmNoZWNrZWRJdGVtcyA9IHNlbGVjdGlvbi51bmNoZWNrZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNoZWNrZWRJdGVtcyxcbiAgICAgIHVuY2hlY2tlZEl0ZW1zXG4gICAgfTtcbiAgfVxuXG4gIGNvcnJlY3RDaGVja2VkKCk6IHZvaWQge1xuICAgIHRoaXMuaW50ZXJuYWxDaGVja2VkID0gdGhpcy5nZXRDb3JyZWN0Q2hlY2tlZCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRDb3JyZWN0Q2hlY2tlZCgpOiBib29sZWFuIHtcbiAgICBsZXQgY2hlY2tlZDogYm9vbGVhbiA9IG51bGw7XG4gICAgaWYgKCFpc05pbCh0aGlzLmludGVybmFsQ2hpbGRyZW4pKSB7XG4gICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIHRoaXMuaW50ZXJuYWxDaGlsZHJlbikge1xuICAgICAgICBjaGlsZC5pbnRlcm5hbENoZWNrZWQgPSBjaGlsZC5nZXRDb3JyZWN0Q2hlY2tlZCgpO1xuICAgICAgICBpZiAoY2hlY2tlZCA9PT0gbnVsbCkge1xuICAgICAgICAgIGNoZWNrZWQgPSBjaGlsZC5pbnRlcm5hbENoZWNrZWQ7XG4gICAgICAgIH0gZWxzZSBpZiAoY2hlY2tlZCAhPT0gY2hpbGQuaW50ZXJuYWxDaGVja2VkKSB7XG4gICAgICAgICAgY2hlY2tlZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjaGVja2VkID0gdGhpcy5jaGVja2VkO1xuICAgIH1cblxuICAgIHJldHVybiBjaGVja2VkO1xuICB9XG59XG4iXX0=