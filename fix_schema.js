const fs = require('fs');
let c = fs.readFileSync('prisma/schema.prisma', 'utf8');

c = c.replace(/enum Role \{[\s\S]*?\}/g, '');
c = c.replace(/enum UserStatus \{[\s\S]*?\}/g, '');
c = c.replace(/enum TrackingStatus \{[\s\S]*?\}/g, '');

c = c.replace(/role\s+Role\s+@default\(NORMAL\)/g, 'role String @default("NORMAL")');
c = c.replace(/status\s+UserStatus\s+@default\(ACTIVE\)/g, 'status String @default("ACTIVE")');
c = c.replace(/overrideStatus\s+TrackingStatus\?/g, 'overrideStatus String?');

fs.writeFileSync('prisma/schema.prisma', c);
