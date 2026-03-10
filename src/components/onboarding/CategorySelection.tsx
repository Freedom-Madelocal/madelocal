import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import * as LucideIcons from "lucide-react";

interface Category {
  id: string;
  label: string;
  icon: string | null;
}

interface Props {
  selectedCategories: string[];
  onToggle: (id: string) => void;
  onNext: () => void;
}

function CategoryIcon({ name, className }: { name: string | null; className?: string }) {
  if (!name) return null;
  const Icon = (LucideIcons as any)[name];
  if (!Icon) return <span className={className}>•</span>;
  return <Icon className={className} />;
}

export default function CategorySelection({ selectedCategories, onToggle, onNext }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    supabase
      .from("categories")
      .select("id,label,icon")
      .then(({ data }) => {
        if (data) {
          const prioritized = ["eggs", "baked", "produce", "honey and syrup"];
          const sorted = [...(data as Category[])].sort((a, b) => {
            const aIdx = prioritized.findIndex(p => a.label.toLowerCase().includes(p));
            const bIdx = prioritized.findIndex(p => b.label.toLowerCase().includes(p));
            if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
            if (aIdx !== -1) return -1;
            if (bIdx !== -1) return 1;
            return 0;
          });
          setCategories(sorted);
        }
      });
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-2 text-3xl font-bold text-foreground"
      >
        What are you looking for?
      </motion.h2>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-10 text-muted-foreground"
      >
        Select as many as you'd like
      </motion.p>

      <div className="mb-10 flex max-w-md flex-col items-center gap-4">
        {categories.length > 0 && (() => {
          const hero = categories[0];
          const isHeroSelected = selectedCategories.includes(hero.id);
          return (
            <motion.button
              key={hero.id}
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{
                y: 0,
                opacity: 1,
                scale: 1,
                ...(isHeroSelected ? {} : { y: [0, -6, 0] }),
              }}
              transition={
                isHeroSelected
                  ? { duration: 0.2 }
                  : {
                      y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                    }
              }
              whileTap={{ scale: 0.95 }}
              onClick={() => onToggle(hero.id)}
              className={`flex items-center gap-2 rounded-full border-2 px-5 py-3 text-base font-medium transition-all duration-200 ${
                isHeroSelected
                  ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "border-border bg-card text-foreground hover:border-primary/40 shadow-sm"
              }`}
            >
              <CategoryIcon name={hero.icon} className="h-5 w-5" />
              <span>{hero.label}</span>
            </motion.button>
          );
        })()}

        <div className="flex flex-wrap justify-center gap-3">
          {categories.slice(1).map((cat, i) => {
            const isSelected = selectedCategories.includes(cat.id);
            return (
              <motion.button
                key={cat.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{
                  y: 0,
                  opacity: 1,
                  ...(isSelected ? {} : { y: [0, -6, 0] }),
                }}
                transition={
                  isSelected
                    ? { duration: 0.2 }
                    : {
                        delay: (i + 1) * 0.05,
                        y: {
                          duration: 2.5 + ((i + 1) % 3) * 0.4,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: (i + 1) * 0.3,
                        },
                      }
                }
                whileTap={{ scale: 0.95 }}
                onClick={() => onToggle(cat.id)}
                className={`flex items-center gap-2 rounded-full border-2 px-5 py-3 text-base font-medium transition-all duration-200 ${
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "border-border bg-card text-foreground hover:border-primary/40 shadow-sm"
                }`}
              >
                <CategoryIcon name={cat.icon} className="h-5 w-5" />
                <span>{cat.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: selectedCategories.length > 0 ? 1 : 0.4 }}
      >
        <Button
          onClick={onNext}
          disabled={selectedCategories.length === 0}
          size="lg"
          className="rounded-full px-10 py-6 text-lg font-semibold shadow-lg"
        >
          Continue
        </Button>
      </motion.div>
    </div>
  );
}
