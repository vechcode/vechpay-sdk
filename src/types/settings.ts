export interface SettingsMap {
  [key: string]: string;
}

export interface SettingItem {
  key: string;
  value: string;
  group?: string;
}

export interface UpdateSettingsRequest {
  settings: SettingItem[];
}
