import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useValidateCoupon, Coupon } from '@/hooks/useCoupons';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Ticket, X, Check, Percent } from 'lucide-react';

interface CouponInputProps {
  cartTotal: number;
  onCouponApplied: (coupon: Coupon, discountAmount: number) => void;
  onCouponRemoved: () => void;
  appliedCoupon: Coupon | null;
  discountAmount: number;
}

export function CouponInput({
  cartTotal,
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon,
  discountAmount,
}: CouponInputProps) {
  const [code, setCode] = useState('');
  const validateCoupon = useValidateCoupon();
  const { toast } = useToast();

  const handleApplyCoupon = async () => {
    if (!code.trim()) return;

    try {
      const result = await validateCoupon.mutateAsync({
        code: code.trim(),
        cartTotal,
      });
      
      onCouponApplied(result.coupon, result.discountAmount);
      setCode('');
      toast({
        title: 'Coupon appliqué',
        description: `Réduction de ${result.discountAmount.toFixed(3)} TND`,
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Code invalide',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveCoupon = () => {
    onCouponRemoved();
    toast({
      title: 'Coupon retiré',
    });
  };

  if (appliedCoupon) {
    return (
      <div className="bg-success-muted border border-success/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success-muted flex items-center justify-center">
              <Check className="h-5 w-5 text-success" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <code className="bg-success-muted text-success-foreground px-2 py-0.5 rounded text-sm font-mono">
                  {appliedCoupon.code}
                </code>
                {appliedCoupon.discount_type === 'percentage' ? (
                  <span className="text-sm text-success flex items-center gap-1">
                    <Percent className="h-3 w-3" />
                    {appliedCoupon.discount_value}% de réduction
                  </span>
                ) : (
                  <span className="text-sm text-success">
                    -{appliedCoupon.discount_value.toFixed(3)} TND
                  </span>
                )}
              </div>
              <p className="text-sm text-success">
                Économie: -{discountAmount.toFixed(3)} TND
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemoveCoupon}
            className="text-success hover:text-success-foreground hover:bg-success-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-2">
        <Ticket className="h-4 w-4" />
        Code promo
      </label>
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Entrez votre code"
          className="uppercase font-mono"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleApplyCoupon();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleApplyCoupon}
          disabled={!code.trim() || validateCoupon.isPending}
        >
          {validateCoupon.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Appliquer'
          )}
        </Button>
      </div>
    </div>
  );
}
