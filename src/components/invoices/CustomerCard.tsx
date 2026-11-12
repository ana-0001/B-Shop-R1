/** src/components/invoices/CustomerCard.tsx — بطاقة بيانات العميل (الاسم + الهواتف/العناوين) */
import { useState } from 'react'
import { UserRound, Plus, X } from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { useInvoicesStore } from '@/stores/invoices'
import type { InvoiceDraft } from '@/stores/invoices'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export interface CustomerCardProps {
  draft: InvoiceDraft
}

export function CustomerCard({ draft }: CustomerCardProps) {
  const { t } = useI18n()
  const patchTab = useInvoicesStore(state => state.patchTab)
  const addContact = useInvoicesStore(state => state.addContact)
  const removeContact = useInvoicesStore(state => state.removeContact)
  const [contactValue, setContactValue] = useState('')

  function updateCustomerName(value: string): void {
    patchTab(draft.id, { customerName: value.trim() || 'Walk-in Customer' })
  }

  function setContactTab(tab: 'phones' | 'addresses'): void {
    patchTab(draft.id, { customerTab: tab })
  }

  function handleAddContact(): void {
    addContact(draft.id, contactValue)
    setContactValue('')
  }

  const activeContacts =
    draft.customerTab === 'addresses' ? draft.customerAddresses : draft.customerPhones

  return (
    <div className="bg-surface-alt p-sm rounded border border-border flex flex-col gap-sm">
      {/* اسم العميل */}
      <div className="flex items-center gap-xs pb-xs border-b border-border">
        <label className="font-bold text-bg-f text-xs whitespace-nowrap flex items-center gap-xs">
          <UserRound className="w-3.5 h-3.5 text-primary" />
          {t('inv.customerName')}:
        </label>
        <Input
          type="text"
          value={draft.customerName}
          className="flex-1 font-bold text-primary"
          aria-label="Customer name"
          onChange={event => updateCustomerName(event.target.value)}
        />
      </div>

      {/* تبويب الهواتف / العناوين */}
      <div className="flex items-center gap-xs border-b border-border bg-surface p-xs rounded text-xs font-bold">
        <button
          type="button"
          className={`px-sm py-xs rounded flex-1 ${draft.customerTab !== 'addresses' ? 'bg-surface-alt text-primary shadow-sm' : 'text-muted-f'}`}
          onClick={() => setContactTab('phones')}
        >
          {t('inv.phones')} ({draft.customerPhones.length})
        </button>
        <button
          type="button"
          className={`px-sm py-xs rounded flex-1 ${draft.customerTab === 'addresses' ? 'bg-surface-alt text-primary shadow-sm' : 'text-muted-f'}`}
          onClick={() => setContactTab('addresses')}
        >
          {t('inv.addresses')} ({draft.customerAddresses.length})
        </button>
      </div>

      {/* إضافة وعرض جهات الاتصال */}
      <div className="space-y-xs flex-1 flex flex-col justify-between">
        <div className="flex gap-xs">
          <Input
            value={contactValue}
            type="text"
            placeholder={t('inv.contactPlaceholder')}
            className="flex-1 text-xs"
            aria-label="Add customer contact"
            onKeyDown={event => event.key === 'Enter' && handleAddContact()}
            onChange={event => setContactValue(event.target.value)}
          />
          <Button variant="primary" size="sm" aria-label="Save contact" onClick={handleAddContact}>
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="max-h-20 overflow-y-auto border border-border rounded bg-surface p-xs text-xs font-mono space-y-xs">
          {activeContacts.map((entry, index) => (
            <div
              key={`${entry}-${index}`}
              className="flex justify-between items-center py-xs border-b border-border last:border-b-0"
            >
              <span className="truncate pe-xs">{entry}</span>
              <button
                type="button"
                className="text-err px-xs"
                aria-label="Delete contact"
                onClick={() => removeContact(draft.id, index)}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
