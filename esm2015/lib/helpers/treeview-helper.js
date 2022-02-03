import { concat, isNil, pull } from 'lodash';
export const TreeviewHelper = {
    findItem,
    findItemInList,
    findParent,
    removeItem,
    concatSelection
};
function findItem(root, value) {
    if (isNil(root)) {
        return undefined;
    }
    if (root.value === value) {
        return root;
    }
    if (root.children) {
        for (const child of root.children) {
            const foundItem = findItem(child, value);
            if (foundItem) {
                return foundItem;
            }
        }
    }
    return undefined;
}
function findItemInList(list, value) {
    if (isNil(list)) {
        return undefined;
    }
    for (const item of list) {
        const foundItem = findItem(item, value);
        if (foundItem) {
            return foundItem;
        }
    }
    return undefined;
}
function findParent(root, item) {
    if (isNil(root) || isNil(root.children)) {
        return undefined;
    }
    for (const child of root.children) {
        if (child === item) {
            return root;
        }
        else {
            const parent = findParent(child, item);
            if (parent) {
                return parent;
            }
        }
    }
    return undefined;
}
function removeItem(root, item) {
    const parent = findParent(root, item);
    if (parent) {
        pull(parent.children, item);
        if (parent.children.length === 0) {
            parent.children = undefined;
        }
        else {
            parent.correctChecked();
        }
        return true;
    }
    return false;
}
function concatSelection(items, checked, unchecked) {
    let checkedItems = [...checked];
    let uncheckedItems = [...unchecked];
    for (const item of items) {
        const selection = item.getSelection();
        checkedItems = concat(checkedItems, selection.checkedItems);
        uncheckedItems = concat(uncheckedItems, selection.uncheckedItems);
    }
    return {
        checked: checkedItems,
        unchecked: uncheckedItems
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZXZpZXctaGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbmd4LXRyZWV2aWV3L3NyYy9saWIvaGVscGVycy90cmVldmlldy1oZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBRzdDLE1BQU0sQ0FBQyxNQUFNLGNBQWMsR0FBRztJQUM1QixRQUFRO0lBQ1IsY0FBYztJQUNkLFVBQVU7SUFDVixVQUFVO0lBQ1YsZUFBZTtDQUNoQixDQUFDO0FBRUYsU0FBUyxRQUFRLENBQUMsSUFBa0IsRUFBRSxLQUFVO0lBQzlDLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ2YsT0FBTyxTQUFTLENBQUM7S0FDbEI7SUFFRCxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssS0FBSyxFQUFFO1FBQ3hCLE9BQU8sSUFBSSxDQUFDO0tBQ2I7SUFFRCxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7UUFDakIsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2pDLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDekMsSUFBSSxTQUFTLEVBQUU7Z0JBQ2IsT0FBTyxTQUFTLENBQUM7YUFDbEI7U0FDRjtLQUNGO0lBRUQsT0FBTyxTQUFTLENBQUM7QUFDbkIsQ0FBQztBQUVELFNBQVMsY0FBYyxDQUFDLElBQW9CLEVBQUUsS0FBVTtJQUN0RCxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUNmLE9BQU8sU0FBUyxDQUFDO0tBQ2xCO0lBRUQsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLEVBQUU7UUFDdkIsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN4QyxJQUFJLFNBQVMsRUFBRTtZQUNiLE9BQU8sU0FBUyxDQUFDO1NBQ2xCO0tBQ0Y7SUFFRCxPQUFPLFNBQVMsQ0FBQztBQUNuQixDQUFDO0FBRUQsU0FBUyxVQUFVLENBQUMsSUFBa0IsRUFBRSxJQUFrQjtJQUN4RCxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1FBQ3ZDLE9BQU8sU0FBUyxDQUFDO0tBQ2xCO0lBRUQsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1FBQ2pDLElBQUksS0FBSyxLQUFLLElBQUksRUFBRTtZQUNsQixPQUFPLElBQUksQ0FBQztTQUNiO2FBQU07WUFDTCxNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3ZDLElBQUksTUFBTSxFQUFFO2dCQUNWLE9BQU8sTUFBTSxDQUFDO2FBQ2Y7U0FDRjtLQUNGO0lBRUQsT0FBTyxTQUFTLENBQUM7QUFDbkIsQ0FBQztBQUVELFNBQVMsVUFBVSxDQUFDLElBQWtCLEVBQUUsSUFBa0I7SUFDeEQsTUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN0QyxJQUFJLE1BQU0sRUFBRTtRQUNWLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzVCLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ2hDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDO1NBQzdCO2FBQU07WUFDTCxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7U0FDekI7UUFDRCxPQUFPLElBQUksQ0FBQztLQUNiO0lBRUQsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDO0FBRUQsU0FBUyxlQUFlLENBQUMsS0FBcUIsRUFBRSxPQUF1QixFQUFFLFNBQXlCO0lBQ2hHLElBQUksWUFBWSxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQztJQUNoQyxJQUFJLGNBQWMsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUM7SUFDcEMsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7UUFDeEIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3RDLFlBQVksR0FBRyxNQUFNLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUM1RCxjQUFjLEdBQUcsTUFBTSxDQUFDLGNBQWMsRUFBRSxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUM7S0FDbkU7SUFDRCxPQUFPO1FBQ0wsT0FBTyxFQUFFLFlBQVk7UUFDckIsU0FBUyxFQUFFLGNBQWM7S0FDMUIsQ0FBQztBQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjb25jYXQsIGlzTmlsLCBwdWxsIH0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IFRyZWV2aWV3SXRlbSB9IGZyb20gJy4uL21vZGVscy90cmVldmlldy1pdGVtJztcblxuZXhwb3J0IGNvbnN0IFRyZWV2aWV3SGVscGVyID0ge1xuICBmaW5kSXRlbSxcbiAgZmluZEl0ZW1Jbkxpc3QsXG4gIGZpbmRQYXJlbnQsXG4gIHJlbW92ZUl0ZW0sXG4gIGNvbmNhdFNlbGVjdGlvblxufTtcblxuZnVuY3Rpb24gZmluZEl0ZW0ocm9vdDogVHJlZXZpZXdJdGVtLCB2YWx1ZTogYW55KTogVHJlZXZpZXdJdGVtIHtcbiAgaWYgKGlzTmlsKHJvb3QpKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIGlmIChyb290LnZhbHVlID09PSB2YWx1ZSkge1xuICAgIHJldHVybiByb290O1xuICB9XG5cbiAgaWYgKHJvb3QuY2hpbGRyZW4pIHtcbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIHJvb3QuY2hpbGRyZW4pIHtcbiAgICAgIGNvbnN0IGZvdW5kSXRlbSA9IGZpbmRJdGVtKGNoaWxkLCB2YWx1ZSk7XG4gICAgICBpZiAoZm91bmRJdGVtKSB7XG4gICAgICAgIHJldHVybiBmb3VuZEl0ZW07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gZmluZEl0ZW1Jbkxpc3QobGlzdDogVHJlZXZpZXdJdGVtW10sIHZhbHVlOiBhbnkpOiBUcmVldmlld0l0ZW0ge1xuICBpZiAoaXNOaWwobGlzdCkpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgZm9yIChjb25zdCBpdGVtIG9mIGxpc3QpIHtcbiAgICBjb25zdCBmb3VuZEl0ZW0gPSBmaW5kSXRlbShpdGVtLCB2YWx1ZSk7XG4gICAgaWYgKGZvdW5kSXRlbSkge1xuICAgICAgcmV0dXJuIGZvdW5kSXRlbTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBmaW5kUGFyZW50KHJvb3Q6IFRyZWV2aWV3SXRlbSwgaXRlbTogVHJlZXZpZXdJdGVtKTogVHJlZXZpZXdJdGVtIHtcbiAgaWYgKGlzTmlsKHJvb3QpIHx8IGlzTmlsKHJvb3QuY2hpbGRyZW4pKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIGZvciAoY29uc3QgY2hpbGQgb2Ygcm9vdC5jaGlsZHJlbikge1xuICAgIGlmIChjaGlsZCA9PT0gaXRlbSkge1xuICAgICAgcmV0dXJuIHJvb3Q7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHBhcmVudCA9IGZpbmRQYXJlbnQoY2hpbGQsIGl0ZW0pO1xuICAgICAgaWYgKHBhcmVudCkge1xuICAgICAgICByZXR1cm4gcGFyZW50O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUl0ZW0ocm9vdDogVHJlZXZpZXdJdGVtLCBpdGVtOiBUcmVldmlld0l0ZW0pOiBib29sZWFuIHtcbiAgY29uc3QgcGFyZW50ID0gZmluZFBhcmVudChyb290LCBpdGVtKTtcbiAgaWYgKHBhcmVudCkge1xuICAgIHB1bGwocGFyZW50LmNoaWxkcmVuLCBpdGVtKTtcbiAgICBpZiAocGFyZW50LmNoaWxkcmVuLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcGFyZW50LmNoaWxkcmVuID0gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJlbnQuY29ycmVjdENoZWNrZWQoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGNvbmNhdFNlbGVjdGlvbihpdGVtczogVHJlZXZpZXdJdGVtW10sIGNoZWNrZWQ6IFRyZWV2aWV3SXRlbVtdLCB1bmNoZWNrZWQ6IFRyZWV2aWV3SXRlbVtdKTogeyBbazogc3RyaW5nXTogVHJlZXZpZXdJdGVtW10gfSB7XG4gIGxldCBjaGVja2VkSXRlbXMgPSBbLi4uY2hlY2tlZF07XG4gIGxldCB1bmNoZWNrZWRJdGVtcyA9IFsuLi51bmNoZWNrZWRdO1xuICBmb3IgKGNvbnN0IGl0ZW0gb2YgaXRlbXMpIHtcbiAgICBjb25zdCBzZWxlY3Rpb24gPSBpdGVtLmdldFNlbGVjdGlvbigpO1xuICAgIGNoZWNrZWRJdGVtcyA9IGNvbmNhdChjaGVja2VkSXRlbXMsIHNlbGVjdGlvbi5jaGVja2VkSXRlbXMpO1xuICAgIHVuY2hlY2tlZEl0ZW1zID0gY29uY2F0KHVuY2hlY2tlZEl0ZW1zLCBzZWxlY3Rpb24udW5jaGVja2VkSXRlbXMpO1xuICB9XG4gIHJldHVybiB7XG4gICAgY2hlY2tlZDogY2hlY2tlZEl0ZW1zLFxuICAgIHVuY2hlY2tlZDogdW5jaGVja2VkSXRlbXNcbiAgfTtcbn1cbiJdfQ==