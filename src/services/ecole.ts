/** Kharandi École — uniquement les routes Xano actuellement disponibles. */
import { api } from '../config/api';
import { unsupportedXanoEndpoint } from '../config/xanoRoutes';

const payload = (data: any) => data?.data || data;
const asList = (data: any) => {
  const value = payload(data) || [];
  return Array.isArray(value) ? value : value?.items || value?.results || [];
};

export async function schoolLogin(email: string, password: string) {
  const { data } = await api.post('/ecole/login/', { email, password });
  return payload(data);
}

export async function getSchools() {
  const { data } = await api.get('/ecole/schools');
  return asList(data);
}

export async function getSchool(schoolId: string) {
  const { data } = await api.get(`/ecole/schools/${encodeURIComponent(schoolId)}`);
  return payload(data);
}

export async function createSchool(body: Record<string, any>) {
  const { data } = await api.post('/ecole/schools', body);
  return payload(data);
}

export async function updateSchool(schoolId: string, body: Record<string, any>) {
  const { data } = await api.patch(`/ecole/schools/${encodeURIComponent(schoolId)}`, body);
  return payload(data);
}

export async function deleteSchool(schoolId: string) {
  const { data } = await api.delete(`/ecole/schools/${encodeURIComponent(schoolId)}`);
  return payload(data);
}

export async function setSchoolStatus(schoolId: string, action: 'approve' | 'suspend' | 'restore') {
  const { data } = await api.post(`/ecole/schools/${encodeURIComponent(schoolId)}/${action}`);
  return payload(data);
}

export async function getStudents(schoolId: string) {
  if (!schoolId) return [];
  const { data } = await api.get(`/ecole/schools/${encodeURIComponent(schoolId)}/students`);
  return asList(data);
}

export async function getClasses(schoolId: string) {
  const { data } = await api.get('/ecole/classes', { params: schoolId ? { school_id: schoolId } : {} });
  return asList(data);
}

export async function addClass(schoolId: string, name: string, academicYear?: string) {
  const { data } = await api.post('/ecole/classes', {
    school_id: Number(schoolId),
    name,
    ...(academicYear ? { academic_year: academicYear } : {}),
  });
  return payload(data);
}

export async function getClass(id: string) {
  const { data } = await api.get(`/ecole/classes/${encodeURIComponent(id)}`);
  return payload(data);
}

export async function updateClass(id: string, body: Record<string, any>) {
  const { data } = await api.patch(`/ecole/classes/${encodeURIComponent(id)}`, body);
  return payload(data);
}

export async function deleteClass(id: string) {
  const { data } = await api.delete(`/ecole/classes/${encodeURIComponent(id)}`);
  return payload(data);
}

export async function restoreClass(id: string) {
  const { data } = await api.post(`/ecole/classes/${encodeURIComponent(id)}/restore`);
  return payload(data);
}

export async function addGrade(input: {
  student_id: string | number; subject_id: string | number;
  value: string | number; trimester: string;
}) {
  const body = {
    student_id: Number(input.student_id),
    subject_id: Number(input.subject_id),
    value: Number(input.value),
    trimester: input.trimester,
  };
  if (![body.student_id, body.subject_id].every(Number.isInteger)) throw new Error('Identifiants de note invalides.');
  const { data } = await api.post('/ecole/grades', body);
  return payload(data);
}

export async function verifyActivationCode(_code: string, _email: string): Promise<any> { return unsupportedXanoEndpoint("Vérification du code d'activation école"); }
export async function finalizeActivation(_code: string, _email: string, _password: string): Promise<any> { return unsupportedXanoEndpoint("Activation d'une école"); }
export async function teacherLogin(_email: string, _password: string): Promise<any> { return unsupportedXanoEndpoint('Connexion enseignant'); }
export async function parentLookup(_matricule: string): Promise<any> { return unsupportedXanoEndpoint('Connexion parent par matricule'); }
export async function addStudent(schoolId: string, body: any) {
  const { data } = await api.post(`/ecole/schools/${encodeURIComponent(schoolId)}/students`, body);
  return payload(data);
}
export async function getStudent(id: string) {
  const { data } = await api.get(`/ecole/students/${encodeURIComponent(id)}`);
  return payload(data);
}
export async function updateStudent(id: string, body: any) {
  const { data } = await api.patch(`/ecole/students/${encodeURIComponent(id)}`, body);
  return payload(data);
}
export async function deleteStudent(id: string) {
  const { data } = await api.delete(`/ecole/students/${encodeURIComponent(id)}`);
  return payload(data);
}
export async function restoreStudent(id: string) {
  const { data } = await api.post(`/ecole/students/${encodeURIComponent(id)}/restore`);
  return payload(data);
}
export async function importStudents(file: File, schoolId?: string) {
  const formData = new FormData();
  formData.append('csv_file', file);
  if (schoolId) formData.append('school_id', schoolId);
  const { data } = await api.post('/ecole/students/import', formData);
  return payload(data);
}
export async function exportStudents(schoolId?: string) {
  const { data } = await api.get('/ecole/students/export', {
    params: schoolId ? { school_id: schoolId } : {},
    responseType: 'blob',
  });
  return data as Blob;
}
export async function getGrades(_params: { school_id?: string; student_id?: string } = {}) { return []; }
export async function getPayments(_schoolId: string) { return []; }
export async function addPayment(_body: any) { return unsupportedXanoEndpoint("Enregistrement d'un paiement scolaire"); }
export async function markPaymentPaid(_id: string) { return unsupportedXanoEndpoint("Validation d'un paiement scolaire"); }
export async function getAbsences(_schoolId: string) { return []; }
export async function addAbsence(_body: any) { return unsupportedXanoEndpoint("Enregistrement d'une absence"); }
export async function getTeachers(schoolId: string) {
  const { data } = await api.get('/ecole/teachers', { params: schoolId ? { school_id: schoolId } : {} });
  return asList(data);
}
export async function addTeacher(body: any) {
  const { data } = await api.post('/ecole/teachers', body);
  return payload(data);
}
export async function getTeacher(id: string) {
  const { data } = await api.get(`/ecole/teachers/${encodeURIComponent(id)}`);
  return payload(data);
}
export async function updateTeacher(id: string, body: any) {
  const { data } = await api.patch(`/ecole/teachers/${encodeURIComponent(id)}`, body);
  return payload(data);
}
export async function deleteTeacher(id: string) {
  const { data } = await api.delete(`/ecole/teachers/${encodeURIComponent(id)}`);
  return payload(data);
}
export async function restoreTeacher(id: string) {
  const { data } = await api.post(`/ecole/teachers/${encodeURIComponent(id)}/restore`);
  return payload(data);
}
export async function assignTeacherClasses(id: string, classIds: Array<string | number>) {
  const { data } = await api.post(`/ecole/teachers/${encodeURIComponent(id)}/assign-classes`, {
    class_ids: classIds.map(Number),
  });
  return payload(data);
}
export async function getSchedules(_params: { school_id?: string; student_id?: string } = {}) { return []; }
export async function addSchedule(_body: any) { return unsupportedXanoEndpoint("Ajout d'un emploi du temps"); }
export async function deleteSchedule(_id: string) { return unsupportedXanoEndpoint("Suppression d'un emploi du temps"); }
export async function getExpenses(_schoolId: string) { return []; }
export async function addExpense(_body: any) { return unsupportedXanoEndpoint("Ajout d'une dépense"); }
export async function getAnnouncements(_params: { school_id?: string; student_id?: string } = {}) { return []; }
export async function addAnnouncement(_body: any) { return unsupportedXanoEndpoint("Ajout d'une annonce école"); }
export async function deleteAnnouncement(_id: string) { return unsupportedXanoEndpoint("Suppression d'une annonce école"); }
export async function getBadges(_params: { school_id?: string; student_id?: string } = {}) { return []; }
export async function addBadge(_body: any) { return unsupportedXanoEndpoint("Ajout d'un badge élève"); }
export async function deleteBadge(_id: string) { return unsupportedXanoEndpoint("Suppression d'un badge élève"); }
export async function getSchoolOptions(_schoolId: string): Promise<any> { return {}; }
