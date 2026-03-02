/** Filter control types supported by the declarative filter panel. */
export type FilterControlType = 'select' | 'checkbox-group';

/** Single option for select/checkbox controls. */
export interface FilterOption {
  readonly value: string;
  readonly label: string;
}

/** A single filter field definition. */
export interface FilterFieldConfig {
  /** Maps to query param name + filter object key. */
  readonly key: string;
  /** Display label shown in the filter panel. */
  readonly label: string;
  readonly type: FilterControlType;
  readonly options: readonly FilterOption[];
  /** For select: single vs multi-select. */
  readonly multiple?: boolean;
}

/** A group of filters rendered as a section in the overlay. */
export interface FilterGroupConfig {
  readonly label: string;
  readonly fields: readonly FilterFieldConfig[];
}

/** Top-level: the entire filter panel configuration. */
export type FilterPanelConfig = readonly FilterGroupConfig[];

/** The resulting filter values, keyed by filter field keys. */
export type FilterValues = Record<string, string | string[] | undefined>;
