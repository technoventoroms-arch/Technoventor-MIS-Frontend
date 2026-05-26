class ParamStore {
  orgId: number | null = null;
  labId: number | null = null;

  setOrgId(orgId: number) {
    this.orgId = orgId;
  }
  setLabId(labId: number) {
    this.labId = labId;
  }
  getParams() {
    return { labId: this.labId, orgId: this.orgId };
  }

  bs = (base: string) => {
    return `${this?.orgId}/${this?.labId}/${base}`;
  };
}

const paramStore = new ParamStore();

export default paramStore;
