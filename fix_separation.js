const fs = require('fs');
const actionsPath = 'D:/AndroidStudioProjects/Nubira_Creation/web_admin/src/app/production-orders/actions.ts';
let actionsContent = fs.readFileSync(actionsPath, 'utf8');
actionsContent = actionsContent.replace('let defaultLinemanId = ""', 'let defaultAdminOwnerId = user.id');
actionsContent = actionsContent.replace('.eq("role", "LINEMAN")', '.eq("role", "ADMIN")');
actionsContent = actionsContent.replace('if (lm) defaultLinemanId = lm.id', 'if (lm) defaultAdminOwnerId = lm.id');
actionsContent = actionsContent.replace('if (defaultLinemanId && articleId) {', 'if (defaultAdminOwnerId && articleId) {');
actionsContent = actionsContent.replace('lineman_id: defaultLinemanId,', 'lineman_id: defaultAdminOwnerId,');
if (!actionsContent.includes('is_production_chart_only: true,')) {
  actionsContent = actionsContent.replace('production_order_no: mt_code,', 'is_production_chart_only: true,\n          production_order_no: mt_code,');
}
fs.writeFileSync(actionsPath, actionsContent, 'utf8');

const pagePath = 'D:/AndroidStudioProjects/Nubira_Creation/web_admin/src/app/allotments/page.tsx';
let pageContent = fs.readFileSync(pagePath, 'utf8');
const oldMapStart = 'const allotments = allotmentsRaw?.map((al) => {';
const newMapStart = const activeLinemanIds = (linemen as any[])?.map(l => l.id) || []\n\n  const allotments = (allotmentsRaw || [])\n    .filter(al => {\n      if (!activeLinemanIds.includes(al.lineman_id)) return false\n      const alMaterials = materials.filter(m => m.allotment_id === al.id)\n      for (const m of alMaterials) {\n        if (m.notes) {\n          try {\n            const parsed = JSON.parse(m.notes)\n            if (parsed.is_production_chart_only === true) return false\n          } catch (_) {}\n        }\n      }\n      return true\n    })\n    .map((al) => {;
if (pageContent.includes(oldMapStart)) {
  pageContent = pageContent.replace(oldMapStart, newMapStart);
  fs.writeFileSync(pagePath, pageContent, 'utf8');
}
console.log('SUCCESS: Updated separation logic!');