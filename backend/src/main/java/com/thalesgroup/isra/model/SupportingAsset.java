package com.thalesgroup.isra.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "supporting_assets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportingAsset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnore
    private IsraProject project;

    @Column(name = "asset_id", nullable = false)
    private Integer assetId;

    @Column(name = "hld_id")
    private String hldId;

    @Column(name = "asset_name", nullable = false)
    private String assetName;

    @Column(name = "asset_type")
    private String assetType;

    @Column(name = "security_level")
    private Integer securityLevel;

    @ManyToMany
    @JoinTable(
        name = "supporting_business_assets",
        joinColumns = @JoinColumn(name = "supporting_asset_id"),
        inverseJoinColumns = @JoinColumn(name = "business_asset_id")
    )
    @Builder.Default
    private List<BusinessAsset> businessAssets = new ArrayList<>();
}
