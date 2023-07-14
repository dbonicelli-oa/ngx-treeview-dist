export declare class TreeviewConfig {
    hasAllCheckBox: boolean;
    hasFilter: boolean;
    hasCollapseExpand: boolean;
    decoupleChildFromParent: boolean;
    filterHidden: boolean;
    maxHeight: number;
    get hasDivider(): boolean;
    static create(fields?: {
        hasAllCheckBox?: boolean;
        hasFilter?: boolean;
        hasCollapseExpand?: boolean;
        decoupleChildFromParent?: boolean;
        filterHidden?: boolean;
        maxHeight?: number;
    }): TreeviewConfig;
}
