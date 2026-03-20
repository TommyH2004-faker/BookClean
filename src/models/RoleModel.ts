class RoleModel {
   id?: number; // id quyen
   idRole: number; // id quyen
   nameRole: string; // ten quyen

   constructor(idRole: number, nameRole: string) {
      this.idRole = idRole;
      this.nameRole = nameRole;
   }
}

export default RoleModel;