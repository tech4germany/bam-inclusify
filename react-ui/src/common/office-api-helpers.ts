export interface OfficeHostInfo {
  readonly host: Office.HostType;
  readonly platform: Office.PlatformType;
}

let hostInfo: OfficeHostInfo | undefined;

export function setOfficeHostInfo(newHostInfo: OfficeHostInfo) {
  if (typeof hostInfo !== "undefined") throw new Error("Office host info is already set");
  hostInfo = Object.freeze({ ...newHostInfo });
}

export function getOfficeHostInfo(): OfficeHostInfo {
  if (typeof hostInfo === "undefined") throw new Error("Office host info is not available yet");
  return hostInfo;
}

export function isRunningInOutlook(): boolean {
  return getOfficeHostInfo().host === Office.HostType.Outlook;
}

export function isRunningInWord(): boolean {
  return getOfficeHostInfo().host === Office.HostType.Word;
}
