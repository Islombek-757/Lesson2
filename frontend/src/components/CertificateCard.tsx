import { Award, Calendar, Hash } from 'lucide-react';

export default function CertificateCard({ certificate }: { certificate: any }) {
  return (
    <div className="glass rounded-2xl p-6 border border-yellow-500/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-yellow-500/20 text-yellow-500 flex items-center justify-center">
          <Award size={24} />
        </div>
        <div>
          <h3 className="font-bold text-lg">{certificate.title}</h3>
          <p className="text-sm text-[var(--muted-foreground)]">{certificate.description}</p>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <p className="flex items-center gap-2"><Hash size={14} />ID: {certificate.certificateId}</p>
        <p className="flex items-center gap-2"><Calendar size={14} />Issued: {new Date(certificate.issuedAt).toLocaleDateString()}</p>
        <p className="font-semibold">Score: {certificate.score}%</p>
      </div>
    </div>
  );
}
