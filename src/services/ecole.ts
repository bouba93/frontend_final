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

export async function getStudents(schoolId: string) {
  if (!schoolId) return [];
  const { data } = await api.get(`/ecole/schools/${encodeURIComponent(schoolId)}/students`);
  return asList(data);
}

export async function getClasses(schoolId: string) {
  const { data } = await api.get('/ecole/classes', { params: schoolId ? { school_id: schoolId } : {} });
  return asList(data);
}

export async function addClass(schoolId: string, name: string) {
  const { data } = await api.post('/ecole/classes', { school_id: schoolId, name });
  return payload(data);
}

export async function addGrade(body: any) {
  const { data } = await api.post('/ecole/grades', body);
  return payload(data);
}

export async function verifyActivationCode(_code: string, _email: string): Promise<any> { return unsupportedXanoEndpoint("Vérification du code d'activation école"); }
export async function finalizeActivation(_code: string, _email: string, _password: string): Promise<any> { return unsupportedXanoEndpoint("Activation d'une école"); }
export async function teacherLogin(_email: string, _password: string): Promise<any> { return unsupportedXanoEndpoint('Connexion enseignant'); }
export async function parentLookup(_matricule: string): Promise<any> { return unsupportedXanoEndpoint('Connexion parent par matricule'); }
export async function addStudent(_schoolId: string, _body: any) { return unsupportedXanoEndpoint("Ajout d'un élève"); }
export async function updateStudent(_id: string, _body: any) { return unsupportedXanoEndpoint("Modification d'un élève"); }
export async function deleteStudent(_id: string) { return unsupportedXanoEndpoint("Suppression d'un élève"); }
export async function getGrades(_params: { school_id?: string; student_id?: string } = {}) { return []; }
export async function getPayments(_schoolId: string) { return []; }
export async function addPayment(_body: any) { return unsupportedXanoEndpoint("Enregistrement d'un paiement scolaire"); }
export async function markPaymentPaid(_id: string) { return unsupportedXanoEndpoint("Validation d'un paiement scolaire"); }
export async function getAbsences(_schoolId: string) { return []; }
export async function addAbsence(_body: any) { return unsupportedXanoEndpoint("Enregistrement d'une absence"); }
export async function getTeachers(_schoolId: string) { return []; }
export async function addTeacher(_body: any) { return unsupportedXanoEndpoint("Ajout d'un enseignant"); }
export async function deleteTeacher(_id: string) { return unsupportedXanoEndpoint("Suppression d'un enseignant"); }
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
