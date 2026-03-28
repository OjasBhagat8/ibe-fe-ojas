import { City, State } from "country-state-city";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import BookingStepper from "../components/Stepper/Stepper";
import {
  type BillingInfo,
  type OptionalTravelerDetail,
  type PaymentInfo,
  type TravelerInfo,
  addOptionalTraveler,
  clearBooking,
  clearBookingError,
  enableCheckoutReturn,
  fetchTripItineraryPreview,
  requestGuestBookingOtp,
  resetGuestVerification,
  removeOptionalTraveler,
  submitBooking,
  updateBillingInfo,
  updateOptionalTravelerInfo,
  updatePaymentInfo,
  updateTravelerInfo,
  verifyGuestBookingOtp,
} from "../features/booking/bookingSlice";
import { setActiveStep } from "../features/roomCard/roomResultSlice";
import BillingSection from "./Checkout/BillingSection";
import PaymentSection from "./Checkout/PaymentSection";
import TermsModal from "./Checkout/TermsModal";
import TravelerSection from "./Checkout/TravelerSection";
import TripItinerarySidebar from "./Checkout/TripItinerarySidebar";
import {
  emptyCheckoutErrors,
  hasErrors,
  type CheckoutErrors,
  validateBilling,
  validateCheckoutForm,
  validateTraveler,
} from "./Checkout/checkoutValidation";
import {
  buildFallbackTaxBreakdown,
  buildTaxBreakdownFromPreview,
  formatPhoneForSubmission,
  hasConfiguredTripItineraryApi,
  isAdultGuestType,
  onlyDigits,
} from "./Checkout/checkoutUtils";
import styles from "./Checkout.module.scss";
import { bookingSteps } from "./RoomResults/roomResultsUtils";

type SectionKey = "traveler" | "billing" | "payment";

const Checkout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const auth = useAuth();
  const { tenantName } = useParams<{ tenantName: string }>();
  const booking = useAppSelector((state) => state.booking);
  const selection = booking.selection;
  const itineraryPreview = booking.itineraryPreview;
  const itineraryLoading = booking.itineraryLoading;
  const itineraryError = booking.itineraryError;
  const form = booking.form;
  const { traveler, billing, payment, optionalTravelers } = form;

  const [expandedSection, setExpandedSection] = useState<SectionKey>("traveler");
  const [showTerms, setShowTerms] = useState(false);
  const [optionalTravelersMessage, setOptionalTravelersMessage] = useState("");
  const [showPromotionPopover, setShowPromotionPopover] = useState(false);
  const [showTaxesPopover, setShowTaxesPopover] = useState(false);
  const [errors, setErrors] = useState<CheckoutErrors>(emptyCheckoutErrors);
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [guestVerificationMessage, setGuestVerificationMessage] = useState("");
  const promotionPopoverRef = useRef<HTMLDivElement | null>(null);
  const taxesPopoverRef = useRef<HTMLDivElement | null>(null);
  const isGuestCheckout = !auth.isAuthenticated;
  const guestVerification = booking.guestVerification;
  const normalizedBillingEmail = billing.email.trim().toLowerCase();
  const normalizedBillingPhone = formatPhoneForSubmission(billing.phoneCountryCode, billing.phone);
  const authProfile = auth.user?.profile;

  useEffect(() => {
    dispatch(setActiveStep(2));

    return () => {
      dispatch(clearBookingError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!selection) {
      return;
    }

    setErrors(emptyCheckoutErrors());
    setOptionalTravelersMessage("");
    void dispatch(fetchTripItineraryPreview());
  }, [dispatch, selection]);

  useEffect(() => {
    if (!auth.isAuthenticated || !authProfile) {
      return;
    }

    const givenName = typeof authProfile.given_name === "string" ? authProfile.given_name.trim() : "";
    const familyName = typeof authProfile.family_name === "string" ? authProfile.family_name.trim() : "";
    const fullName = typeof authProfile.name === "string" ? authProfile.name.trim() : "";
    const email = typeof authProfile.email === "string" ? authProfile.email.trim() : "";
    const fallbackFirstName = givenName || fullName.split(/\s+/)[0] || "";
    const fallbackLastName = familyName || fullName.split(/\s+/).slice(1).join(" ") || "";

    const travelerUpdates: Partial<TravelerInfo> = {};
    if (!traveler.firstName && fallbackFirstName) {
      travelerUpdates.firstName = fallbackFirstName;
    }
    if (!traveler.lastName && fallbackLastName) {
      travelerUpdates.lastName = fallbackLastName;
    }
    if (!traveler.email && email) {
      travelerUpdates.email = email;
    }

    if (Object.keys(travelerUpdates).length > 0) {
      dispatch(updateTravelerInfo(travelerUpdates));
    }

    const billingUpdates: Partial<BillingInfo> = {};
    if (!billing.firstName && fallbackFirstName) {
      billingUpdates.firstName = fallbackFirstName;
    }
    if (!billing.lastName && fallbackLastName) {
      billingUpdates.lastName = fallbackLastName;
    }
    if (!billing.email && email) {
      billingUpdates.email = email;
    }

    if (Object.keys(billingUpdates).length > 0) {
      dispatch(updateBillingInfo(billingUpdates));
    }
  }, [
    auth.isAuthenticated,
    authProfile,
    billing.email,
    billing.firstName,
    billing.lastName,
    dispatch,
    traveler.email,
    traveler.firstName,
    traveler.lastName,
  ]);

  useEffect(() => {
    if (!isGuestCheckout || !guestVerification.verificationId) {
      return;
    }

    if (guestVerification.email !== normalizedBillingEmail || guestVerification.phone !== normalizedBillingPhone) {
      dispatch(resetGuestVerification());
      setEmailOtp("");
      setPhoneOtp("");
      setGuestVerificationMessage("");
    }
  }, [
    dispatch,
    guestVerification.email,
    guestVerification.phone,
    guestVerification.verificationId,
    isGuestCheckout,
    normalizedBillingEmail,
    normalizedBillingPhone,
  ]);

  useEffect(() => {
    if (!showPromotionPopover) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!promotionPopoverRef.current?.contains(event.target as Node)) {
        setShowPromotionPopover(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [showPromotionPopover]);

  useEffect(() => {
    if (!showTaxesPopover) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!taxesPopoverRef.current?.contains(event.target as Node)) {
        setShowTaxesPopover(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [showTaxesPopover]);

  const stateOptions = useMemo(
    () =>
      billing.country
        ? State.getStatesOfCountry(billing.country).map((stateOption) => ({
            value: stateOption.isoCode,
            label: stateOption.name,
          }))
        : [],
    [billing.country]
  );

  const cityOptions = useMemo(
    () =>
      billing.country && billing.state
        ? City.getCitiesOfState(billing.country, billing.state).map((cityOption) => ({
            value: cityOption.name,
            label: cityOption.name,
          }))
        : [],
    [billing.country, billing.state]
  );

  const itineraryMeta = useMemo(() => {
    if (!selection) return null;

    const checkInDate = parseISO(selection.search.checkIn);
    const checkOutDate = parseISO(selection.search.checkOut);
    const nights = Math.max(differenceInCalendarDays(checkOutDate, checkInDate), 1);
    const guestSummary = selection.search.guestSelections
      .filter((guest) => guest.count > 0)
      .map((guest) => `${guest.count} ${guest.guestTypeName.toLowerCase()}`)
      .join(" | ");

    return {
      arrival: format(checkInDate, "MMM d"),
      departure: format(checkOutDate, "MMM d, yyyy"),
      nights,
      guestSummary,
    };
  }, [selection]);

  const summaryData = useMemo(() => {
    if (!selection) {
      return null;
    }

    if (itineraryPreview) {
      return {
        subtotal: itineraryPreview.subtotal,
        taxesAndSurcharges: itineraryPreview.taxesAndSurcharges,
        dueNow: itineraryPreview.dueNow,
        dueAtResort: itineraryPreview.dueAtResort,
        promoTitle: itineraryPreview.promotionName || selection.summary.promoTitle,
      };
    }

    if (hasConfiguredTripItineraryApi && !itineraryLoading && itineraryError) {
      return null;
    }

    return selection.summary;
  }, [itineraryError, itineraryLoading, itineraryPreview, selection]);

  const taxBreakdown = useMemo(() => {
    if (!selection) {
      return null;
    }

    if (hasConfiguredTripItineraryApi && !itineraryLoading && itineraryError) {
      return null;
    }

    return itineraryPreview ? buildTaxBreakdownFromPreview(itineraryPreview) : buildFallbackTaxBreakdown(selection);
  }, [itineraryError, itineraryLoading, itineraryPreview, selection]);

  const optionalTravelerCapacity = useMemo(
    () =>
      selection
        ? Math.max(
            selection.search.guestSelections.reduce((total, guestSelection) => total + guestSelection.count, 0)
              - (selection.search.guestSelections.some(
                (guestSelection) => isAdultGuestType(guestSelection.guestTypeName) && guestSelection.count > 0
              )
                ? 1
                : 0),
            0
          )
        : 0,
    [selection]
  );

  const nextOptionalTraveler = useMemo(() => {
    if (!selection) {
      return null;
    }

    const adultGuestType = selection.search.guestSelections.find(
      (guestSelection) => isAdultGuestType(guestSelection.guestTypeName) && guestSelection.count > 0
    );
    const guestTypeCounts = optionalTravelers.reduce<Record<string, number>>((counts, optionalTraveler) => {
      counts[optionalTraveler.guestTypeName] = (counts[optionalTraveler.guestTypeName] ?? 0) + 1;
      return counts;
    }, {});

    for (const guestSelection of selection.search.guestSelections) {
      const reservedPrimaryCount = adultGuestType?.guestTypeName === guestSelection.guestTypeName ? 1 : 0;
      const currentCount = guestTypeCounts[guestSelection.guestTypeName] ?? 0;
      const availableCount = guestSelection.count - reservedPrimaryCount;
      if (currentCount < availableCount) {
        const travelerNumber = currentCount + 1 + reservedPrimaryCount;
        return {
          id: `${guestSelection.guestTypeName}-${currentCount + 1}`,
          guestTypeName: guestSelection.guestTypeName,
          label: `${guestSelection.guestTypeName} ${travelerNumber}`,
          firstName: "",
          lastName: "",
        } satisfies OptionalTravelerDetail;
      }
    }

    return null;
  }, [optionalTravelers, selection]);

  const updateErrors = (changes: Partial<CheckoutErrors>) => {
    setErrors((current) => ({
      traveler: changes.traveler ? { ...current.traveler, ...changes.traveler } : current.traveler,
      billing: changes.billing ? { ...current.billing, ...changes.billing } : current.billing,
      payment: changes.payment ? { ...current.payment, ...changes.payment } : current.payment,
    }));
  };

  const handleTravelerChange = (field: keyof TravelerInfo, value: string) => {
    const nextValue = field === "phone" ? onlyDigits(value).slice(0, 15) : value;
    dispatch(updateTravelerInfo({ [field]: nextValue }));
    if (field === "phoneCountryCode") {
      updateErrors({ traveler: { phoneCountryCode: undefined, phone: undefined } });
      return;
    }
    if (errors.traveler[field]) {
      updateErrors({ traveler: { [field]: undefined } });
    }
  };

  const handleOptionalTravelerChange = (
    id: string,
    field: "firstName" | "lastName",
    value: string
  ) => {
    dispatch(updateOptionalTravelerInfo({ id, changes: { [field]: value } }));
  };

  const handleRemoveOptionalTraveler = (id: string) => {
    dispatch(removeOptionalTraveler(id));
    setOptionalTravelersMessage("");
  };

  const handleBillingChange = (field: keyof BillingInfo, value: string) => {
    const nextValue = field === "phone" ? onlyDigits(value).slice(0, 15) : value;
    dispatch(updateBillingInfo({ [field]: nextValue }));
    if (field === "phoneCountryCode") {
      updateErrors({ billing: { phoneCountryCode: undefined, phone: undefined } });
      return;
    }
    if (field === "city") {
      updateErrors({ billing: { city: undefined, zipCode: undefined } });
      return;
    }
    if (errors.billing[field]) {
      updateErrors({ billing: { [field]: undefined } });
    }
  };

  const handleCountryChange = (value: string) => {
    dispatch(
      updateBillingInfo({
        country: value,
        state: "",
        city: "",
        phoneCountryCode:
          !billing.phoneCountryCode || billing.phoneCountryCode === billing.country
            ? value
            : billing.phoneCountryCode,
      })
    );
    updateErrors({
      billing: {
        country: undefined,
        state: undefined,
        city: undefined,
        zipCode: undefined,
      },
    });
  };

  const handleStateChange = (value: string) => {
    dispatch(updateBillingInfo({ state: value, city: "" }));
    updateErrors({
      billing: {
        state: undefined,
        city: undefined,
        zipCode: undefined,
      },
    });
  };

  const handlePaymentChange = (field: keyof PaymentInfo, value: string | boolean) => {
    dispatch(updatePaymentInfo({ [field]: value }));
    if (errors.payment[field]) {
      updateErrors({ payment: { [field]: undefined } });
    }
  };

  const handleContinueShopping = () => {
    if (!tenantName) return;
    dispatch(enableCheckoutReturn());
    dispatch(setActiveStep(1));
    navigate(`/${tenantName}/room-results`);
  };

  const handleCancel = () => {
    if (!tenantName) return;
    dispatch(clearBooking());
    dispatch(setActiveStep(1));
    navigate(`/${tenantName}/room-results`);
  };

  const handleAddOptionalTraveler = () => {
    if (!nextOptionalTraveler) {
      setOptionalTravelersMessage("You only selected this many guests for the reservation.");
      return;
    }

    dispatch(addOptionalTraveler(nextOptionalTraveler));
    setOptionalTravelersMessage("");
  };

  const goToBilling = () => {
    const travelerErrors = validateTraveler(traveler);
    setErrors((current) => ({ ...current, traveler: travelerErrors }));

    if (hasErrors(travelerErrors)) {
      setExpandedSection("traveler");
      return;
    }

    if (!billing.email) {
      dispatch(updateBillingInfo({ email: traveler.email }));
    }

    if (!billing.phone) {
      dispatch(
        updateBillingInfo({
          phone: traveler.phone,
          phoneCountryCode: traveler.phoneCountryCode,
        })
      );
    }

    setExpandedSection("billing");
  };

  const goToPayment = () => {
    if (guestVerification.requestLoading) {
      return;
    }

    const billingErrors = validateBilling(billing);
    setErrors((current) => ({ ...current, billing: billingErrors }));

    if (hasErrors(billingErrors)) {
      setExpandedSection("billing");
      return;
    }

    if (!isGuestCheckout) {
      setExpandedSection("payment");
      return;
    }

    void (async () => {
      const contactsChanged = Boolean(
        guestVerification.verificationId
        && (
          guestVerification.email !== normalizedBillingEmail
          || guestVerification.phone !== normalizedBillingPhone
        )
      );

      try {
        if (!guestVerification.verificationId || contactsChanged) {
          if (contactsChanged) {
            dispatch(resetGuestVerification());
          }
          await dispatch(
            requestGuestBookingOtp({
              email: normalizedBillingEmail,
              phone: normalizedBillingPhone,
            })
          ).unwrap();
          setEmailOtp("");
          setPhoneOtp("");
          setGuestVerificationMessage("Verification codes sent to your email and phone.");
          setExpandedSection("billing");
          return;
        }

        if (guestVerification.emailVerified && guestVerification.phoneVerified) {
          setGuestVerificationMessage("");
          setExpandedSection("payment");
          return;
        }
      } catch {
        setExpandedSection("billing");
        return;
      }

      setGuestVerificationMessage("Verify both email and phone before continuing.");
      setExpandedSection("billing");
    })();
  };

  const handleResendOtps = () => {
    if (guestVerification.requestLoading) {
      return;
    }

    void (async () => {
      try {
        await dispatch(
          requestGuestBookingOtp({
            email: normalizedBillingEmail,
            phone: normalizedBillingPhone,
          })
        ).unwrap();
        setEmailOtp("");
        setPhoneOtp("");
        setGuestVerificationMessage("Fresh OTPs have been sent.");
      } catch {
        setExpandedSection("billing");
      }
    })();
  };

  const handleVerifyEmailOtp = () => {
    if (!guestVerification.verificationId) {
      setGuestVerificationMessage("Request OTPs first.");
      setExpandedSection("billing");
      return;
    }

    const verificationId = guestVerification.verificationId;

    if (!emailOtp.trim()) {
      setGuestVerificationMessage("Enter the email OTP to verify.");
      setExpandedSection("billing");
      return;
    }

    void (async () => {
      try {
        const result = await dispatch(
          verifyGuestBookingOtp({
            verificationId,
            channel: "EMAIL",
            otp: emailOtp.trim(),
          })
        ).unwrap();

        setGuestVerificationMessage(
          result.phoneVerified
            ? "Email and phone are verified. You can continue to payment."
            : "Email verified. Verify the phone OTP to continue."
        );
      } catch {
        setExpandedSection("billing");
      }
    })();
  };

  const handleVerifyPhoneOtp = () => {
    if (!guestVerification.verificationId) {
      setGuestVerificationMessage("Request OTPs first.");
      setExpandedSection("billing");
      return;
    }

    const verificationId = guestVerification.verificationId;

    if (!phoneOtp.trim()) {
      setGuestVerificationMessage("Enter the phone OTP to verify.");
      setExpandedSection("billing");
      return;
    }

    void (async () => {
      try {
        const result = await dispatch(
          verifyGuestBookingOtp({
            verificationId,
            channel: "PHONE",
            otp: phoneOtp.trim(),
          })
        ).unwrap();

        setGuestVerificationMessage(
          result.emailVerified
            ? "Email and phone are verified. You can continue to payment."
            : "Phone verified. Verify the email OTP to continue."
        );
      } catch {
        setExpandedSection("billing");
      }
    })();
  };

  const completeBooking = async () => {
    const validationErrors = validateCheckoutForm(form);
    setErrors(validationErrors);

    if (hasErrors(validationErrors.traveler)) {
      setExpandedSection("traveler");
      return;
    }

    if (hasErrors(validationErrors.billing)) {
      setExpandedSection("billing");
      return;
    }

    if (hasErrors(validationErrors.payment)) {
      setExpandedSection("payment");
      return;
    }

    try {
      const confirmation = await dispatch(submitBooking()).unwrap();
      navigate(
        `/${tenantName}/confirmation?confirmationToken=${encodeURIComponent(confirmation.confirmationToken)}`,
        { replace: true }
      );
    } catch {
      setExpandedSection("payment");
    }
  };

  const canOpenBillingSection = expandedSection !== "traveler";
  const canOpenPaymentSection = expandedSection === "payment";

  if (!selection || !tenantName) {
    return (
      <div className={styles.emptyState}>
        <h1>Checkout</h1>
        <p>Select a package from room results before proceeding to checkout.</p>
        <button type="button" onClick={() => navigate(tenantName ? `/${tenantName}/room-results` : "/")}>
          Back to rooms
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <BookingStepper steps={bookingSteps} activeStep={2} />

      <div className={styles.content}>
        <section className={styles.formPanel}>
          <h1>Payment Info</h1>

          <TravelerSection
            errors={errors.traveler}
            expanded={expandedSection === "traveler"}
            optionalTravelerCapacity={optionalTravelerCapacity}
            optionalTravelers={optionalTravelers}
            optionalTravelersMessage={optionalTravelersMessage}
            traveler={traveler}
            onTravelerChange={handleTravelerChange}
            onOptionalTravelerChange={handleOptionalTravelerChange}
            onRemoveTraveler={handleRemoveOptionalTraveler}
            onToggle={() => setExpandedSection("traveler")}
            onAddTraveler={handleAddOptionalTraveler}
            onNext={goToBilling}
          />

          <BillingSection
            billing={billing}
            canToggle={canOpenBillingSection}
            cityOptions={cityOptions}
            emailOtp={emailOtp}
            emailVerified={guestVerification.emailVerified}
            errors={errors.billing}
            expanded={expandedSection === "billing"}
            guestMessage={guestVerificationMessage}
            isGuestCheckout={isGuestCheckout}
            nextDisabled={guestVerification.requestLoading}
            otpRequested={guestVerification.otpRequested}
            otpRequestLoading={guestVerification.requestLoading}
            otpVerifyLoading={guestVerification.verifyLoading}
            phoneOtp={phoneOtp}
            phoneVerified={guestVerification.phoneVerified}
            stateOptions={stateOptions}
            verificationError={guestVerification.error}
            onBillingChange={handleBillingChange}
            onChangeEmailOtp={setEmailOtp}
            onChangePhoneOtp={setPhoneOtp}
            onCountryChange={handleCountryChange}
            onStateChange={handleStateChange}
            onToggle={() => canOpenBillingSection && setExpandedSection("billing")}
            onEditTraveler={() => setExpandedSection("traveler")}
            onNext={goToPayment}
            onResendOtps={handleResendOtps}
            onVerifyEmailOtp={handleVerifyEmailOtp}
            onVerifyPhoneOtp={handleVerifyPhoneOtp}
          />

          <PaymentSection
            bookingError={booking.error}
            canToggle={canOpenPaymentSection}
            dueNow={summaryData?.dueNow ?? null}
            errors={errors.payment}
            expanded={expandedSection === "payment"}
            loading={booking.loading}
            payment={payment}
            onPaymentChange={handlePaymentChange}
            onToggle={() => canOpenPaymentSection && setExpandedSection("payment")}
            onEditBilling={() => setExpandedSection("billing")}
            onOpenTerms={() => setShowTerms(true)}
            onSubmit={() => void completeBooking()}
          />
        </section>

        <TripItinerarySidebar
          itineraryMeta={itineraryMeta}
          itineraryPreview={itineraryPreview}
          promotionPopoverRef={promotionPopoverRef}
          selection={selection}
          setShowPromotionPopover={setShowPromotionPopover}
          setShowTaxesPopover={setShowTaxesPopover}
          showPromotionPopover={showPromotionPopover}
          showTaxesPopover={showTaxesPopover}
          summaryData={summaryData}
          taxBreakdown={taxBreakdown}
          taxesPopoverRef={taxesPopoverRef}
          onCancel={handleCancel}
          onContinueShopping={handleContinueShopping}
        />
      </div>

      <TermsModal
        isOpen={showTerms}
        sections={itineraryPreview?.termsAndConditions?.sections}
        title={itineraryPreview?.termsAndConditions?.title}
        onClose={() => setShowTerms(false)}
      />
    </div>
  );
};

export default Checkout;


