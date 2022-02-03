import { isBoolean, isNil, isString } from 'lodash';
import { TreeviewHelper } from '../helpers/treeview-helper';
export class TreeviewItem {
    constructor(item, autoCorrectChecked = false) {
        this.internalDisabled = false;
        this.internalChecked = true;
        this.internalCollapsed = false;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZXZpZXctaXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL25neC10cmVldmlldy9zcmMvbGliL21vZGVscy90cmVldmlldy1pdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUNwRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFnQjVELE1BQU0sT0FBTyxZQUFZO0lBUXZCLFlBQVksSUFBYyxFQUFFLGtCQUFrQixHQUFHLEtBQUs7UUFQOUMscUJBQWdCLEdBQUcsS0FBSyxDQUFDO1FBQ3pCLG9CQUFlLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLHNCQUFpQixHQUFHLEtBQUssQ0FBQztRQU1oQyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNmLE1BQU0sSUFBSSxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztTQUN6QztRQUNELElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN2QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7U0FDdkI7YUFBTTtZQUNMLE1BQU0sSUFBSSxLQUFLLENBQUMsc0NBQXNDLENBQUMsQ0FBQztTQUN6RDtRQUNELElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN4QixJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDM0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1NBQzdCO1FBQ0QsSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzdCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztTQUNqQztRQUNELElBQUksU0FBUyxDQUFD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LE1BQU0sU0FBUyxHQUFHLGNBQWMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLFlBQVksRUFBRSxjQUFjLENBQUMsQ0FBQztZQUN0RyxZQUFZLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQztZQUNqQyxjQUFjLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQztTQUN0QztRQUVELE9BQU87WUFDTCxZQUFZO1lBQ1osY0FBYztTQUNmLENBQUM7SUFDSixDQUFDO0lBRUQsY0FBYztRQUNaLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDbEQsQ0FBQztJQUVPLGlCQUFpQjtRQUN2QixJQUFJLE9BQU8sR0FBWSxJQUFJLENBQUM7UUFDNUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtZQUNqQyxLQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtnQkFDekMsS0FBSyxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQkFDbEQsSUFBSSxPQUFPLEtBQUssSUFBSSxFQUFFO29CQUNwQixPQUFPLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQztpQkFDakM7cUJBQU0sSUFBSSxPQUFPLEtBQUssS0FBSyxDQUFDLGVBQWUsRUFBRTtvQkFDNUMsT0FBTyxHQUFHLFNBQVMsQ0FBQztvQkFDcEIsTUFBTTtpQkFDUDthQUNGO1NBQ0Y7YUFBTTtZQUNMLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1NBQ3hCO1FBRUQsT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgaXNCb29sZWFuLCBpc05pbCwgaXNTdHJpbmcgfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgVHJlZXZpZXdIZWxwZXIgfSBmcm9tICcuLi9oZWxwZXJzL3RyZWV2aWV3LWhlbHBlcic7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVHJlZXZpZXdTZWxlY3Rpb24ge1xuICBjaGVja2VkSXRlbXM6IFRyZWV2aWV3SXRlbVtdO1xuICB1bmNoZWNrZWRJdGVtczogVHJlZXZpZXdJdGVtW107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVHJlZUl0ZW0ge1xuICB0ZXh0OiBzdHJpbmc7XG4gIHZhbHVlOiBhbnk7XG4gIGRpc2FibGVkPzogYm9vbGVhbjtcbiAgY2hlY2tlZD86IGJvb2xlYW47XG4gIGNvbGxhcHNlZD86IGJvb2xlYW47XG4gIGNoaWxkcmVuPzogVHJlZUl0ZW1bXTtcbn1cblxuZXhwb3J0IGNsYXNzIFRyZWV2aWV3SXRlbSB7XG4gIHByaXZhdGUgaW50ZXJuYWxEaXNhYmxlZCA9IGZhbHNlO1xuICBwcml2YXRlIGludGVybmFsQ2hlY2tlZCA9IHRydWU7XG4gIHByaXZhdGUgaW50ZXJuYWxDb2xsYXBzZWQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBpbnRlcm5hbENoaWxkcmVuOiBUcmVldmlld0l0ZW1bXTtcbiAgdGV4dDogc3RyaW5nO1xuICB2YWx1ZTogYW55O1xuXG4gIGNvbnN0cnVjdG9yKGl0ZW06IFRyZWVJdGVtLCBhdXRvQ29ycmVjdENoZWNrZWQgPSBmYWxzZSkge1xuICAgIGlmIChpc05pbChpdGVtKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJdGVtIG11c3QgYmUgZGVmaW5lZCcpO1xuICAgIH1cbiAgICBpZiAoaXNTdHJpbmcoaXRlbS50ZXh0KSkge1xuICAgICAgdGhpcy50ZXh0ID0gaXRlbS50ZXh0O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0EgdGV4dCBvZiBpdGVtIG11c3QgYmUgc3RyaW5nIG9iamVjdCcpO1xuICAgIH1cbiAgICB0aGlzLnZhbHVlID0gaXRlbS52YWx1ZTtcbiAgICBpZiAoaXNCb29sZWFuKGl0ZW0uY2hlY2tlZCkpIHtcbiAgICAgIHRoaXMuY2hlY2tlZCA9IGl0ZW0uY2hlY2tlZDtcbiAgICB9XG4gICAgaWYgKGlzQm9vbGVhbihpdGVtLmNvbGxhcHNlZCkpIHtcbiAgICAgIHRoaXMuY29sbGFwc2VkID0gaXRlbS5jb2xsYXBzZWQ7XG4gICAgfVxuICAgIGlmIChpc0Jvb2xlYW4oaXRlbS5kaXNhYmxlZCkpIHtcbiAgICAgIHRoaXMuZGlzYWJsZWQgPSBpdGVtLmRpc2FibGVkO1xuICAgIH1cbiAgICBpZiAoIWlzTmlsKGl0ZW0uY2hpbGRyZW4pICYmIGl0ZW0uY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5jaGlsZHJlbiA9IGl0ZW0uY2hpbGRyZW4ubWFwKGNoaWxkID0+IHtcbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQgPT09IHRydWUpIHtcbiAgICAgICAgICBjaGlsZC5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFRyZWV2aWV3SXRlbShjaGlsZCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoYXV0b0NvcnJlY3RDaGVja2VkKSB7XG4gICAgICB0aGlzLmNvcnJlY3RDaGVja2VkKCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0IGNoZWNrZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxDaGVja2VkO1xuICB9XG5cbiAgc2V0IGNoZWNrZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgICBpZiAoIXRoaXMuaW50ZXJuYWxEaXNhYmxlZCkge1xuICAgICAgaWYgKHRoaXMuaW50ZXJuYWxDaGVja2VkICE9PSB2YWx1ZSkge1xuICAgICAgICB0aGlzLmludGVybmFsQ2hlY2tlZCA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldCBpbmRldGVybWluYXRlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNoZWNrZWQgPT09IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHNldENoZWNrZWRSZWN1cnNpdmUodmFsdWU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaW50ZXJuYWxEaXNhYmxlZCkge1xuICAgICAgdGhpcy5pbnRlcm5hbENoZWNrZWQgPSB2YWx1ZTtcbiAgICAgIGlmICghaXNOaWwodGhpcy5pbnRlcm5hbENoaWxkcmVuKSkge1xuICAgICAgICB0aGlzLmludGVybmFsQ2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiBjaGlsZC5zZXRDaGVja2VkUmVjdXJzaXZlKHZhbHVlKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsRGlzYWJsZWQ7XG4gIH1cblxuICBzZXQgZGlzYWJsZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgICBpZiAodGhpcy5pbnRlcm5hbERpc2FibGVkICE9PSB2YWx1ZSkge1xuICAgICAgdGhpcy5pbnRlcm5hbERpc2FibGVkID0gdmFsdWU7XG4gICAgICBpZiAoIWlzTmlsKHRoaXMuaW50ZXJuYWxDaGlsZHJlbikpIHtcbiAgICAgICAgdGhpcy5pbnRlcm5hbENoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4gY2hpbGQuZGlzYWJsZWQgPSB2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0IGNvbGxhcHNlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbENvbGxhcHNlZDtcbiAgfVxuXG4gIHNldCBjb2xsYXBzZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgICBpZiAodGhpcy5pbnRlcm5hbENvbGxhcHNlZCAhPT0gdmFsdWUpIHtcbiAgICAgIHRoaXMuaW50ZXJuYWxDb2xsYXBzZWQgPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICBzZXRDb2xsYXBzZWRSZWN1cnNpdmUodmFsdWU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLmludGVybmFsQ29sbGFwc2VkID0gdmFsdWU7XG4gICAgaWYgKCFpc05pbCh0aGlzLmludGVybmFsQ2hpbGRyZW4pKSB7XG4gICAgICB0aGlzLmludGVybmFsQ2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiBjaGlsZC5zZXRDb2xsYXBzZWRSZWN1cnNpdmUodmFsdWUpKTtcbiAgICB9XG4gIH1cblxuICBnZXQgY2hpbGRyZW4oKTogVHJlZXZpZXdJdGVtW10ge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsQ2hpbGRyZW47XG4gIH1cblxuICBzZXQgY2hpbGRyZW4odmFsdWU6IFRyZWV2aWV3SXRlbVtdKSB7XG4gICAgaWYgKHRoaXMuaW50ZXJuYWxDaGlsZHJlbiAhPT0gdmFsdWUpIHtcbiAgICAgIGlmICghaXNOaWwodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NoaWxkcmVuIG11c3QgYmUgbm90IGFuIGVtcHR5IGFycmF5Jyk7XG4gICAgICB9XG4gICAgICB0aGlzLmludGVybmFsQ2hpbGRyZW4gPSB2YWx1ZTtcbiAgICAgIGlmICghaXNOaWwodGhpcy5pbnRlcm5hbENoaWxkcmVuKSkge1xuICAgICAgICBsZXQgY2hlY2tlZCA9IG51bGw7XG4gICAgICAgIHRoaXMuaW50ZXJuYWxDaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcbiAgICAgICAgICBpZiAoY2hlY2tlZCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgY2hlY2tlZCA9IGNoaWxkLmNoZWNrZWQ7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChjaGlsZC5jaGVja2VkICE9PSBjaGVja2VkKSB7XG4gICAgICAgICAgICAgIGNoZWNrZWQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmludGVybmFsQ2hlY2tlZCA9IGNoZWNrZWQ7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0U2VsZWN0aW9uKCk6IFRyZWV2aWV3U2VsZWN0aW9uIHtcbiAgICBsZXQgY2hlY2tlZEl0ZW1zOiBUcmVldmlld0l0ZW1bXSA9IFtdO1xuICAgIGxldCB1bmNoZWNrZWRJdGVtczogVHJlZXZpZXdJdGVtW10gPSBbXTtcbiAgICBpZiAoaXNOaWwodGhpcy5pbnRlcm5hbENoaWxkcmVuKSkge1xuICAgICAgaWYgKHRoaXMuaW50ZXJuYWxDaGVja2VkKSB7XG4gICAgICAgIGNoZWNrZWRJdGVtcy5wdXNoKHRoaXMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdW5jaGVja2VkSXRlbXMucHVzaCh0aGlzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qgc2VsZWN0aW9uID0gVHJlZXZpZXdIZWxwZXIuY29uY2F0U2VsZWN0aW9uKHRoaXMuaW50ZXJuYWxDaGlsZHJlbiwgY2hlY2tlZEl0ZW1zLCB1bmNoZWNrZWRJdGVtcyk7XG4gICAgICBjaGVja2VkSXRlbXMgPSBzZWxlY3Rpb24uY2hlY2tlZDtcbiAgICAgIHVuY2hlY2tlZEl0ZW1zID0gc2VsZWN0aW9uLnVuY2hlY2tlZDtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgY2hlY2tlZEl0ZW1zLFxuICAgICAgdW5jaGVja2VkSXRlbXNcbiAgICB9O1xuICB9XG5cbiAgY29ycmVjdENoZWNrZWQoKTogdm9pZCB7XG4gICAgdGhpcy5pbnRlcm5hbENoZWNrZWQgPSB0aGlzLmdldENvcnJlY3RDaGVja2VkKCk7XG4gIH1cblxuICBwcml2YXRlIGdldENvcnJlY3RDaGVja2VkKCk6IGJvb2xlYW4ge1xuICAgIGxldCBjaGVja2VkOiBib29sZWFuID0gbnVsbDtcbiAgICBpZiAoIWlzTmlsKHRoaXMuaW50ZXJuYWxDaGlsZHJlbikpIHtcbiAgICAgIGZvciAoY29uc3QgY2hpbGQgb2YgdGhpcy5pbnRlcm5hbENoaWxkcmVuKSB7XG4gICAgICAgIGNoaWxkLmludGVybmFsQ2hlY2tlZCA9IGNoaWxkLmdldENvcnJlY3RDaGVja2VkKCk7XG4gICAgICAgIGlmIChjaGVja2VkID09PSBudWxsKSB7XG4gICAgICAgICAgY2hlY2tlZCA9IGNoaWxkLmludGVybmFsQ2hlY2tlZDtcbiAgICAgICAgfSBlbHNlIGlmIChjaGVja2VkICE9PSBjaGlsZC5pbnRlcm5hbENoZWNrZWQpIHtcbiAgICAgICAgICBjaGVja2VkID0gdW5kZWZpbmVkO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNoZWNrZWQgPSB0aGlzLmNoZWNrZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNoZWNrZWQ7XG4gIH1cbn1cbiJdfQ==