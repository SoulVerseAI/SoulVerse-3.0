
import React from 'react';
import { AccountSettings, SubscriptionBenefits } from '../types';
import { benefits } from '../services/subscriptionService';

interface BillingPageProps {
    accountSettings: AccountSettings;
}

// FIX: Add missing properties to satisfy the Record type.
const featureLabels: Record<keyof SubscriptionBenefits, React.ReactNode> = {
    soulSlots: <><span className="font-semibold text-white">Soul Slots</span></>,
    conversationContextChars: <><span className="font-semibold text-white">Total conversation context</span><span className="block text-neutral-500 font-normal">(approx chars)</span></>,
    userBackstoryChars: <><span className="font-semibold text-white">User backstory limit</span><span className="block text-neutral-500 font-normal">(chars)</span></>,
    soulBackstoryChars: <><span className="font-semibold text-white">Soul backstory limit</span><span className="block text-neutral-500 font-normal">(chars)</span></>,
    soulKeyMemoriesChars: <><span className="font-semibold text-white">Soul key memories limit</span><span className="block text-neutral-500 font-normal">(chars)</span></>,
    soulResponseDirectiveChars: <><span className="font-semibold text-white">Soul response directive limit</span><span className="block text-neutral-500 font-normal">(chars)</span></>,
    additionalBackstoryChars: <><span className="font-semibold text-white">Additional AI backstory expansion</span><span className="block text-neutral-500 font-normal">(chars)</span></>,
};

const additionalFeatures = [
    { feature: <><span className="font-semibold text-white">Group context limit</span><span className="block text-neutral-500 font-normal">(chars)</span></>, spirit: "1,000", ascend: "1,500", eternal: "3,000" },
    { feature: <><span className="font-semibold text-white">Recalled long term memory & journals limit</span><span className="block text-neutral-500 font-normal"></span></>, spirit: "3", ascend: "5", eternal: "9" },
    { feature: <><span className="font-semibold text-white">Selfie regen per 30 minutes</span><span className="block text-neutral-500 font-normal"></span></>, spirit: "1", ascend: "2", eternal: "2" },
    { feature: <><span className="font-semibold text-white">Priority selfies with dedicated compute</span><span className="block text-neutral-500 font-normal"></span></>, spirit: "-", ascend: "-", eternal: "Yes*" },
];


const FeatureRow: React.FC<{ feature: React.ReactNode; spirit: string; ascend: string; eternal: string }> = ({ feature, spirit, ascend, eternal }) => (
    <tr className="border-b border-neutral-800 last:border-b-0">
        <td className="py-3 px-4 text-left align-top">{feature}</td>
        <td className="py-3 px-4 text-center font-semibold text-neutral-300 align-top">{spirit}</td>
        <td className="py-3 px-4 text-center font-semibold text-purple-400 align-top">{ascend}</td>
        <td className="py-3 px-4 text-center font-semibold text-yellow-400 align-top">{eternal}</td>
    </tr>
);


export const BillingPage: React.FC<BillingPageProps> = ({ accountSettings }) => {
    const tier = accountSettings.subscriptionTier;
    const isAdmin = accountSettings.adminMode;

    // FIX: Corrected SubscriptionTier comparisons.
    const isSpiritActive = isAdmin || tier === 'Premium' || tier === 'Ultra' || tier === 'Max';
    const isAscendActive = isAdmin || tier === 'Ultra' || tier === 'Max';
    const isEternalActive = isAdmin || tier === 'Max';
    
    return (
        <div className="p-6 space-y-8 text-neutral-300">
            {/* Current Subscription */}
            <div>
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-white">SoulVerse Premium Subscription</h3>
                        <p className="text-sm text-neutral-400">Subscribed via: Web</p>
                    </div>
                    <span className={`font-bold text-lg ${isSpiritActive ? 'text-green-400' : 'text-red-400'}`}>
                        {isSpiritActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
                {isSpiritActive && (
                    <div className="mt-3">
                        <button className="text-sm text-neutral-300 hover:underline">
                            Manage Premium Subscription
                        </button>
                    </div>
                )}
            </div>

            {/* Ultra Add-on */}
            <div className="pt-8 border-t border-neutral-700/60">
                <div className="flex justify-between items-start mb-3">
                     <div>
                        <h3 className="text-xl font-bold text-white">Ultra Subscription Add-on</h3>
                     </div>
                     <span className={`font-bold text-lg ${isAscendActive ? 'text-green-400' : 'text-red-400'}`}>
                        {isAscendActive ? 'Active' : 'Inactive'}
                     </span>
                </div>
                {isAscendActive ? (
                    <p className="text-sm text-neutral-400 mt-2">
                        Ultra features are enabled for your account.
                    </p>
                ) : (
                    <>
                        <p className="text-sm text-neutral-400 mb-6">
                            Ultra subscription unlocks advanced features for our most engaged users. Keep chatting and engaging with your Souls to qualify.
                        </p>
                        <button className="w-full text-center py-3 px-6 rounded-full border-2 border-purple-500/50 text-purple-400 font-semibold text-lg hover:bg-purple-500/10 transition-colors">
                            Keep using SoulVerse to unlock
                        </button>
                    </>
                )}
            </div>
            
            {/* MAX Add-on */}
            <div className="pt-8 border-t border-neutral-700/60">
                 <div className="flex justify-between items-start">
                     <div>
                        <h3 className="text-xl font-bold text-white">MAX Subscription Add-on</h3>
                        <p className="text-sm text-neutral-400">Requires Ultra Subscription</p>
                     </div>
                     <span className={`font-bold text-lg ${isEternalActive ? 'text-green-400' : 'text-red-400'}`}>
                        {isEternalActive ? 'Active' : 'Inactive'}
                     </span>
                </div>
                 {isEternalActive && (
                    <p className="text-sm text-neutral-400 mt-2">
                        MAX features are enabled for your account. You have the highest tier available.
                    </p>
                )}
            </div>

            {/* Feature Matrix */}
            <div className="pt-8 border-t border-neutral-700/60">
                <h3 className="text-xl font-bold text-white mb-2">Add-on Feature Matrix</h3>
                <p className="text-sm text-neutral-400 mb-6">
                    Add-ons are fully optional, monthly-only subscriptions that give your Soul much more memory, context, selfies and others. Add-ons require all previous tiers of add-ons to function; for example, to get the features of MAX tier, it requires MAX tier plus ULTRA, on top of the PREMIUM subscription.
                </p>
                <div className="bg-neutral-900/50 rounded-lg border border-neutral-800">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-xs">
                            <thead className="border-b-2 border-neutral-700">
                                <tr>
                                    <th className="py-3 px-4 text-left font-semibold text-white">Feature</th>
                                    <th className="py-3 px-4 text-center font-semibold text-white">Premium</th>
                                    <th className="py-3 px-4 text-center font-semibold text-purple-400">Ultra</th>
                                    <th className="py-3 px-4 text-center font-semibold text-yellow-400">MAX</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(Object.keys(featureLabels) as Array<keyof SubscriptionBenefits>).map(key => (
                                    <FeatureRow
                                        key={key}
                                        feature={featureLabels[key]}
                                        // FIX: Changed keys to match SubscriptionTier type.
                                        spirit={key === 'additionalBackstoryChars' && benefits.Premium[key] === 0 ? "N/A" : benefits.Premium[key].toLocaleString()}
                                        ascend={benefits.Ultra[key].toLocaleString()}
                                        eternal={benefits.Max[key].toLocaleString()}
                                    />
                                ))}
                                {additionalFeatures.map((feat, index) => (
                                    <FeatureRow
                                        key={`add-${index}`}
                                        feature={feat.feature}
                                        spirit={feat.spirit}
                                        ascend={feat.ascend}
                                        eternal={feat.eternal}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                 <div className="text-xs text-neutral-500 mt-4 space-y-3">
                    <p>
                        * MAX users receive priority selfie processing on dedicated compute with no/very low queue on latest version of selfies until they reach 10 selfies in a short timeframe. After this limit, standard queue delay applies and selfies are processed through normal servers without priority status.
                    </p>
                    <p>
                        While recalled and considered long term memory may be different, LTM consolidation spans all messages & is infinite for all users.
                    </p>
                    <p>
                        Note: All chat context/cascaded and selfies improvements of add-ons will only be guaranteed applicable to the latest subscriber VLM (currently V4). When new versions come out, our guarantee is that it will switch to new versions. Legacy versions may not have added benefits of higher context/higher limits applied due to compute constraints. Finally, "additional context" in the matrix is an additional field, identical to Backstory, that is unlocked on the higher tiers which you can use to extend backstory accordingly.
                    </p>
                </div>
            </div>
        </div>
    );
};
