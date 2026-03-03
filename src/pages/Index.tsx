import { useState, useMemo } from "react";
import { SearchBar } from "@/components/discover/SearchBar";
import { CategoryFilter } from "@/components/discover/CategoryFilter";
import { SellerCard } from "@/components/discover/SellerCard";
import { mockSellers } from "@/data/mock-data";
import logoFull from "@/assets/logo-full.png";

const Index = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    return mockSellers.filter((s) => {
      const matchesCategory = category === "all" || s.category === category;
      const matchesSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.tagline.toLowerCase().includes(search.toLowerCase()) ||
        s.products.some((p) =>
          p.name.toLowerCase().includes(search.toLowerCase())
        );
      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-lg px-4 pb-3 pt-4">
          <img src={logoFull} alt="MadeLocal" className="h-8 object-contain" />
          <p className="mt-1 text-sm text-muted-foreground">
            Discover food near you
          </p>
          <div className="mt-3">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <div className="mt-3">
            <CategoryFilter selected={category} onSelect={setCategory} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4">
        <div className="grid gap-4 pt-2">
          {filtered.map((seller, i) => (
            <SellerCard key={seller.id} seller={seller} index={i} />
          ))}
          {filtered.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              <p className="text-lg font-medium">No sellers found</p>
              <p className="mt-1 text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
