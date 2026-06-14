import { FileCheck, CheckCircle2 } from "lucide-react";
import type { BorrowAgreement } from "@/types";
import { DEFAULT_BORROW_AGREEMENT_TERMS } from "@/types";
import { formatDate, classNames } from "@/utils/format";

interface BorrowAgreementTemplateProps {
  agreement: BorrowAgreement;
  onSign?: (asLender: boolean) => void;
  canSignAsLender?: boolean;
  canSignAsBorrower?: boolean;
}

export default function BorrowAgreementTemplate({
  agreement,
  onSign,
  canSignAsLender = false,
  canSignAsBorrower = false,
}: BorrowAgreementTemplateProps) {
  const terms = agreement.terms.length > 0 ? agreement.terms : DEFAULT_BORROW_AGREEMENT_TERMS;

  return (
    <div className="card bg-gradient-to-b from-amber-50/50 to-wood-50 border-amber-200/60">
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-dashed border-wood-300/60">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <FileCheck size={24} className="text-amber-700" strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-display text-xl text-wood-900">邻里工具借用协议</h3>
            <p className="text-xs text-wood-500 mt-0.5">
              协议编号：{agreement.id.slice(-12).toUpperCase()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="p-3 rounded-xl bg-white/80 border border-wood-200/60">
            <p className="text-xs font-semibold text-wood-500 uppercase tracking-wider mb-1">
              出借人
            </p>
            <p className="font-semibold text-wood-800">{agreement.lenderName}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/80 border border-wood-200/60">
            <p className="text-xs font-semibold text-wood-500 uppercase tracking-wider mb-1">
              借用人
            </p>
            <p className="font-semibold text-wood-800">{agreement.borrowerName}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/80 border border-wood-200/60">
            <p className="text-xs font-semibold text-wood-500 uppercase tracking-wider mb-1">
              借用工具
            </p>
            <p className="font-semibold text-wood-800">{agreement.toolName}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/80 border border-wood-200/60">
            <p className="text-xs font-semibold text-wood-500 uppercase tracking-wider mb-1">
              押金金额
            </p>
            <p className="font-semibold text-safety-orange">
              {agreement.deposit > 0 ? `¥${agreement.deposit}` : "无需押金"}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/80 border border-wood-200/60">
            <p className="text-xs font-semibold text-wood-500 uppercase tracking-wider mb-1">
              借用日期
            </p>
            <p className="font-medium text-wood-800">{formatDate(agreement.borrowDate)}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/80 border border-wood-200/60">
            <p className="text-xs font-semibold text-wood-500 uppercase tracking-wider mb-1">
              预计归还
            </p>
            <p className="font-medium text-wood-800">{formatDate(agreement.expectedReturnDate)}</p>
          </div>
        </div>

        <div className="mb-5">
          <p className="text-sm font-semibold text-wood-800 mb-3">📜 借用条款</p>
          <ol className="space-y-2">
            {terms.map((term, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-wood-700 leading-relaxed">
                <span className="shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </span>
                <span>{term}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed border-wood-300/60">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-wood-700">出借人签字</span>
              {agreement.signedByLender && (
                <span className="flex items-center gap-1 text-xs text-status-good">
                  <CheckCircle2 size={14} />
                  已签署
                </span>
              )}
            </div>
            <div
              className={classNames(
                "p-4 rounded-xl border-2 border-dashed text-center min-h-[60px] flex items-center justify-center",
                agreement.signedByLender
                  ? "border-status-good/40 bg-status-good/5"
                  : "border-wood-300 bg-white"
              )}
            >
              {agreement.signedByLender ? (
                <span className="font-display text-lg text-status-good">
                  ✓ {agreement.lenderName}
                </span>
              ) : canSignAsLender && onSign ? (
                <button
                  type="button"
                  onClick={() => onSign(true)}
                  className="btn-secondary !py-2 !px-4 text-sm"
                >
                  签署协议
                </button>
              ) : (
                <span className="text-wood-400 text-sm">待签署</span>
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-wood-700">借用人签字</span>
              {agreement.signedByBorrower && (
                <span className="flex items-center gap-1 text-xs text-status-good">
                  <CheckCircle2 size={14} />
                  已签署
                </span>
              )}
            </div>
            <div
              className={classNames(
                "p-4 rounded-xl border-2 border-dashed text-center min-h-[60px] flex items-center justify-center",
                agreement.signedByBorrower
                  ? "border-status-good/40 bg-status-good/5"
                  : "border-wood-300 bg-white"
              )}
            >
              {agreement.signedByBorrower ? (
                <span className="font-display text-lg text-status-good">
                  ✓ {agreement.borrowerName}
                </span>
              ) : canSignAsBorrower && onSign ? (
                <button
                  type="button"
                  onClick={() => onSign(false)}
                  className="btn-secondary !py-2 !px-4 text-sm"
                >
                  签署协议
                </button>
              ) : (
                <span className="text-wood-400 text-sm">待签署</span>
              )}
            </div>
          </div>
        </div>

        {agreement.signedAt && (
          <p className="text-center text-xs text-wood-500 mt-4">
            签署于 {formatDate(agreement.signedAt)}
          </p>
        )}
      </div>
    </div>
  );
}
